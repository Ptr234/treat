import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { MobileService } from '../services/mobile.service';
import { NotificationService } from '../services/notification.service';

interface NavigationItem {
  label: string;
  path?: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header 
      class="sticky top-0 z-50 transition-all duration-300"
      [class]="headerClasses()"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo with Uganda Flag -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center space-x-3 group">
              <!-- Uganda Flag -->
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/1200px-Flag_of_Uganda.svg.png" 
                alt="Uganda Flag"
                class="h-8 w-12 rounded shadow-sm group-hover:shadow-md transition-shadow duration-200"
              >
              <!-- Logo -->
              <div class="hidden sm:flex items-center space-x-2">
                <div class="text-xl font-display font-bold text-black">
                  OneStop Centre
                </div>
                <div class="text-sm text-yellow-600 font-medium">Uganda</div>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center space-x-2">
            <ng-container *ngFor="let item of navigationItems()">
              <div class="relative group" *ngIf="!item.children">
                <a 
                  [routerLink]="item.path"
                  routerLinkActive="bg-yellow-50 text-black border-yellow-200"
                  class="text-gray-700 hover:text-black hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent"
                >
                  {{ item.label }}
                </a>
              </div>
              
              <!-- Dropdown Menu -->
              <div class="relative group" *ngIf="item.children">
                <button
                  class="flex items-center text-gray-700 hover:text-black hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent"
                  (click)="toggleDropdown(item.label)"
                >
                  {{ item.label }}
                  <svg class="ml-1 h-4 w-4 transition-transform duration-200" [class.rotate-180]="activeDropdown() === item.label" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  class="absolute left-0 mt-2 w-56 card-modern opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                  [class.opacity-100]="activeDropdown() === item.label"
                  [class.visible]="activeDropdown() === item.label"
                  [class.translate-y-0]="activeDropdown() === item.label"
                >
                  <div class="p-2">
                    <a
                      *ngFor="let subItem of item.children"
                      [routerLink]="subItem.path"
                      class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black rounded-lg transition-colors duration-200 group"
                    >
                      <span class="mr-3 w-2 h-2 bg-red-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></span>
                      {{ subItem.label }}
                    </a>
                  </div>
                </div>
              </div>
            </ng-container>
          </nav>

          <!-- Right Side Actions -->
          <div class="flex items-center space-x-3">
            <!-- Search Button -->
            <button
              (click)="toggleSearch()"
              class="p-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Search"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <!-- Theme Toggle -->
            <button
              (click)="toggleTheme()"
              class="p-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Toggle theme"
            >
              <svg 
                *ngIf="!isDarkMode()" 
                class="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg 
                *ngIf="isDarkMode()" 
                class="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>

            <!-- Authentication -->
            <div *ngIf="!isAuthenticated(); else userMenu">
              <button
                (click)="openAuthModal()"
                class="btn-uganda-primary text-sm px-6 py-2.5"
              >
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </span>
              </button>
            </div>

            <ng-template #userMenu>
              <div class="relative group">
                <button
                  class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  (click)="toggleUserMenu()"
                >
                  <div class="h-9 w-9 strength-gradient rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">{{ getUserInitials() }}</span>
                  </div>
                  <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  class="absolute right-0 mt-2 w-56 card-modern opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                  [class.opacity-100]="isUserMenuOpen()"
                  [class.visible]="isUserMenuOpen()"
                  [class.translate-y-0]="isUserMenuOpen()"
                >
                  <div class="p-2">
                    <div class="px-4 py-3 border-b border-gray-100 mb-2">
                      <div class="text-sm font-medium text-gray-900">{{ currentUser()?.name || 'User' }}</div>
                      <div class="text-xs text-gray-500">{{ currentUser()?.email || 'user@example.com' }}</div>
                    </div>
                    
                    <a routerLink="/profile" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </a>
                    
                    <div class="border-t border-gray-100 my-2"></div>
                    
                    <button 
                      (click)="logout()"
                      class="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </ng-template>

            <!-- Mobile Menu Toggle -->
            <button
              (click)="toggleMobileMenu()"
              class="lg:hidden p-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg 
                *ngIf="!isMobileMenuOpen()" 
                class="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                *ngIf="isMobileMenuOpen()" 
                class="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div 
          class="lg:hidden transition-all duration-300 overflow-hidden"
          [class.max-h-0]="!isMobileMenuOpen()"
          [class.max-h-screen]="isMobileMenuOpen()"
          [class.opacity-0]="!isMobileMenuOpen()"
          [class.opacity-100]="isMobileMenuOpen()"
        >
          <div class="card-modern m-4 p-4">
            <ng-container *ngFor="let item of navigationItems()">
              <a
                *ngIf="!item.children"
                [routerLink]="item.path"
                routerLinkActive="bg-yellow-50 text-black border-l-4 border-yellow-500"
                class="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200 border-l-4 border-transparent"
                (click)="closeMobileMenu()"
              >
                {{ item.label }}
              </a>
              
              <div *ngIf="item.children" class="space-y-1">
                <div class="px-4 py-3 text-base font-semibold text-black border-b border-gray-100">
                  {{ item.label }}
                </div>
                <a
                  *ngFor="let subItem of item.children"
                  [routerLink]="subItem.path"
                  routerLinkActive="bg-yellow-50 text-black"
                  class="block px-8 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                  (click)="closeMobileMenu()"
                >
                  <span class="mr-3 w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                  {{ subItem.label }}
                </a>
              </div>
            </ng-container>
            
            <!-- Mobile Auth Section -->
            <div class="mt-6 pt-6 border-t border-gray-100" *ngIf="!isAuthenticated()">
              <button
                (click)="openAuthModal(); closeMobileMenu()"
                class="w-full btn-uganda-primary text-center"
              >
                Sign In to Your Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Overlay -->
      <div 
        *ngIf="isSearchOpen()"
        class="absolute top-full left-0 right-0 card-modern mx-4 mt-2 border-t-4 border-yellow-500"
      >
        <div class="p-6">
          <div class="relative">
            <input
              #searchInput
              type="text"
              placeholder="Search government services, investment opportunities, or business tools..."
              class="form-input-modern w-full text-lg"
              [(ngModel)]="searchTerm"
              (keyup.enter)="performSearch()"
            >
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center">
              <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button
                (click)="performSearch()"
                class="btn-uganda-accent text-xs px-3 py-1.5"
                [disabled]="!searchTerm.trim()"
              >
                Search
              </button>
            </div>
          </div>
          
          <!-- Quick Search Suggestions -->
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm text-gray-500">Quick searches:</span>
            <button 
              *ngFor="let suggestion of quickSearches()"
              (click)="searchTerm = suggestion; performSearch()"
              class="text-xs bg-gray-100 hover:bg-yellow-100 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-scrolled {
      @apply bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Signals for reactive state
  isScrolled = signal(false);
  activeDropdown = signal<string | null>(null);
  isSearchOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  searchTerm = '';
  
  isAuthenticated = signal(false);
  isDarkMode = signal(false);
  currentUser = signal<any>(null);

  quickSearches = signal([
    'Business Registration',
    'Investment Opportunities', 
    'Tax Calculator',
    'URSB Services',
    'URA Registration',
    'Work Permits'
  ]);

  navigationItems = signal<NavigationItem[]>([
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { 
      label: 'Services', 
      children: [
        { label: 'Business Registration', path: '/registration-wizard' },
        { label: 'Investment Services', path: '/services' },
        { label: 'Government Agencies', path: '/agencies' }
      ]
    },
    { label: 'Investments', path: '/investments' },
    { 
      label: 'Tools', 
      children: [
        { label: 'Tax Calculator', path: '/calculator' },
        { label: 'ROI Calculator', path: '/roi-calculator' },
        { label: 'Document Checklist', path: '/document-checklist' }
      ]
    },
    { label: 'Support', path: '/support' }
  ]);

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private mobileService: MobileService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.auth$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.isAuthenticated.set(authState.isAuthenticated);
        this.currentUser.set(authState.user);
      });

    // Subscribe to theme state
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkMode.set(theme.isDarkMode);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrolled = window.scrollY > 0;
    this.isScrolled.set(scrolled);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.group')) {
      this.activeDropdown.set(null);
      this.isUserMenuOpen.set(false);
    }
  }

  headerClasses(): string {
    const baseClasses = 'bg-white/95 backdrop-blur-sm border-b border-gray-100';
    const scrolledClasses = this.isScrolled() ? 'shadow-lg bg-white/98' : '';
    return `${baseClasses} ${scrolledClasses}`;
  }

  toggleDropdown(label: string): void {
    this.activeDropdown.set(this.activeDropdown() === label ? null : label);
  }

  toggleSearch(): void {
    this.isSearchOpen.set(!this.isSearchOpen());
    if (!this.isSearchOpen()) {
      this.searchTerm = '';
    }
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }

  openAuthModal(): void {
    // TODO: Implement auth modal
    this.notificationService.info('Authentication', 'Auth modal not yet implemented');
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
    this.notificationService.success('Logged out', 'You have been successfully logged out');
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user?.name) return 'U';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }

  performSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
      this.isSearchOpen.set(false);
      this.searchTerm = '';
    }
  }
}