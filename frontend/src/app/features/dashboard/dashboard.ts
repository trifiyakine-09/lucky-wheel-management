import { Component, OnInit, inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [RouterLink],
})
export class Dashboard implements OnInit {
  protected readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.load();
  }
}