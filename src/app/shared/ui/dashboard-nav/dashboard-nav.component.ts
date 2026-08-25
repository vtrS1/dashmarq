import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Discreet switcher between the two dashboards — small text tabs, no chrome. */
@Component({
  selector: 'app-dashboard-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss',
})
export class DashboardNavComponent {}
