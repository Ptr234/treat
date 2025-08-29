import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private mobileSubject = new BehaviorSubject<MobileState>(this.getCurrentState());
  public mobile$ = this.mobileSubject.asObservable();

  constructor() {
    this.initializeListeners();
  }

  get currentState(): MobileState {
    return this.mobileSubject.value;
  }

  get isMobile(): boolean {
    return this.currentState.isMobile;
  }

  get isTablet(): boolean {
    return this.currentState.isTablet;
  }

  get isDesktop(): boolean {
    return this.currentState.isDesktop;
  }

  get isTouchDevice(): boolean {
    return this.currentState.isTouchDevice;
  }

  private initializeListeners(): void {
    // Listen to window resize events
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(250),
        map(() => this.getCurrentState()),
        startWith(this.getCurrentState())
      )
      .subscribe(state => {
        this.mobileSubject.next(state);
      });

    // Listen to orientation change events
    fromEvent(window, 'orientationchange')
      .pipe(
        debounceTime(100),
        map(() => this.getCurrentState())
      )
      .subscribe(state => {
        this.mobileSubject.next(state);
      });
  }

  private getCurrentState(): MobileState {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Define breakpoints
    const mobileBreakpoint = 768;
    const tabletBreakpoint = 1024;
    
    const isMobile = width < mobileBreakpoint;
    const isTablet = width >= mobileBreakpoint && width < tabletBreakpoint;
    const isDesktop = width >= tabletBreakpoint;
    
    const orientation = width > height ? 'landscape' : 'portrait';
    const isTouchDevice = this.detectTouchDevice();

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
      isTouchDevice
    };
  }

  private detectTouchDevice(): boolean {
    return (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      ((navigator as any).msMaxTouchPoints > 0)
    );
  }

  // Utility methods for responsive behavior
  getContainerClass(): string {
    const state = this.currentState;
    if (state.isMobile) return 'container-mobile px-4';
    if (state.isTablet) return 'container-tablet px-6';
    return 'container-desktop px-8';
  }

  getGridColumns(): number {
    const state = this.currentState;
    if (state.isMobile) return 1;
    if (state.isTablet) return 2;
    return 3;
  }

  shouldShowMobileMenu(): boolean {
    return this.currentState.isMobile;
  }

  shouldShowDesktopNavigation(): boolean {
    return this.currentState.isDesktop;
  }
}