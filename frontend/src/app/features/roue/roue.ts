import { Component, OnInit, inject, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CadeauxService } from '../cadeaux/cadeaux.service';
import { RoueService, Gagnant } from './roue.service';
import { WheelSoundService } from './wheel-sound.service';
import { DashboardService } from '../dashboard/dashboard.service';  
//import { ParticipantsService } from '../participants/participants.service';

interface Segment {
  cadeau: { id: number; nom: string; couleur: string | null };
  path: string;
  labelTransform: string;
  fillColor: string;
  textColor: string;
}

@Component({
  selector: 'app-roue',
  standalone: true,
  templateUrl: './roue.html',
  styleUrl: './roue.scss',
})
export class Roue implements OnInit {
  protected readonly cadeauxService = inject(CadeauxService);
  private readonly roueService = inject(RoueService);
  private readonly dashboardService = inject(DashboardService);
  //protected readonly participantsService = inject(ParticipantsService);
readonly showParticipants = signal(false);

//readonly participantsEligibles = computed(() =>
  //this.participantsService.participants().filter((p) => !p.a_gagne)
//);

readonly participantsRestants = computed(() => this.dashboardService.stats()?.participants_restants ?? null);
  
  readonly rotation = signal(0);
  readonly spinning = signal(false);
  readonly winner = signal<Gagnant | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly confettiPieces = signal<{ left: number; delay: number; color: string; rotate: number }[]>([]);

  private animationDone = false;
  private apiResult: Gagnant | null = null;
  private apiError: string | null = null;

  readonly cadeauxActifs = computed(() =>
    this.cadeauxService.cadeaux().filter((c) => c.actif && c.quantite > 0)
  );

  readonly segments = computed<Segment[]>(() => {
    const liste = this.cadeauxActifs();
    const n = liste.length;
    if (n === 0) return [];
    const anglePerSlice = 360 / n;

    return liste.map((cadeau, i) => {
      const startAngle = i * anglePerSlice;
      const endAngle = startAngle + anglePerSlice;
      const midAngle = startAngle + anglePerSlice / 2;
      const fillColor = cadeau.couleur || '#FFC72C';
      return {
        cadeau,
        path: this.slicePath(startAngle, endAngle),
        labelTransform: this.labelTransform(midAngle),
        fillColor,
        textColor: this.textColorFor(fillColor),
      };
    });
  });

  ngOnInit(): void {
    this.cadeauxService.load();
    this.dashboardService.load();
    //this.participantsService.load();
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }
  toggleParticipants(): void {
  this.showParticipants.update((v) => !v);
}

  ngOnDestroy(): void {
  document.removeEventListener('fullscreenchange', this.onFullscreenChange);
}
toggleFullscreen(): void {
  const el = this.roueContainer()?.nativeElement;
  if (!el) return;
  if (!document.fullscreenElement) {
    el.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}


  private polarToCartesian(r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: 200 + r * Math.sin(rad), y: 200 - r * Math.cos(rad) };
  }

  private slicePath(startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(190, startAngle);
    const end = this.polarToCartesian(190, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M 200 200 L ${start.x} ${start.y} A 190 190 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  private labelTransform(midAngle: number): string {
    const pos = this.polarToCartesian(190 * 0.62, midAngle);
    let rotation = midAngle;
    if (midAngle > 90 && midAngle < 270) rotation += 180;
    return `translate(${pos.x}, ${pos.y}) rotate(${rotation})`;
  }

  private textColorFor(hex: string): string {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
  }

  lancer(): void {
    const liste = this.cadeauxActifs();
    if (liste.length === 0 || this.spinning() || this.participantsRestants() === 0) return;

    this.spinning.set(true);
    this.winner.set(null);
    this.errorMessage.set(null);
    this.animationDone = false;
    this.apiResult = null;
    this.apiError = null;

    const targetIndex = Math.floor(Math.random() * liste.length);
    const targetCadeau = liste[targetIndex];
    const anglePerSlice = 360 / liste.length;
    const targetMidAngle = targetIndex * anglePerSlice + anglePerSlice / 2;

    const normalizedCurrent = ((this.rotation() % 360) + 360) % 360;
    const desiredFinalMod = ((360 - targetMidAngle) % 360 + 360) % 360;
    let delta = desiredFinalMod - normalizedCurrent;
    if (delta < 0) delta += 360;

    this.rotation.update((r) => r + 6 * 360 + delta);
    this.soundService.playTickSequence(5000);

    this.roueService.lancerTirage(targetCadeau.id).subscribe({
      next: (gagnant) => { this.apiResult = gagnant; this.tryReveal(); },
      error: (err) => { this.apiError = err.error?.message ?? 'Erreur lors du tirage.'; this.tryReveal(); },
    });
  }

  onSpinEnd(): void {
    if (!this.spinning()) return;
    this.animationDone = true;
    this.tryReveal();
  }

  private tryReveal(): void {
    if (!this.animationDone || (this.apiResult === null && this.apiError === null)) return;
    this.spinning.set(false);
    if (this.apiResult) {
      this.genererConfettis();
      this.soundService.fanfare();
      this.winner.set(this.apiResult);
    } else {
      this.errorMessage.set(this.apiError);
    }
  }

  private genererConfettis(): void {
    const couleurs = ['#E4141E', '#FFC72C', '#2E7D32', '#1976D2', '#8E24AA'];
    this.confettiPieces.set(
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        color: couleurs[Math.floor(Math.random() * couleurs.length)],
        rotate: Math.random() * 360,
      }))
    );
  }

  fermerResultat(): void {
    this.winner.set(null);
    this.cadeauxService.load();
    this.dashboardService.load();
    //this.participantsService.load();
  }
  private readonly soundService = inject(WheelSoundService);
readonly roueContainer = viewChild<ElementRef<HTMLDivElement>>('roueContainer');
readonly isFullscreen = signal(false);
private readonly onFullscreenChange = () => this.isFullscreen.set(!!document.fullscreenElement);
}