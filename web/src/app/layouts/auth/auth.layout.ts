import { Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter, map } from "rxjs";
import Image from "../../components/image/image";

export interface AuthPageData {
  background: string;
  alt: string;
}

@Component({
  imports: [Image, RouterOutlet],
  selector: "auth-layout",
  templateUrl: "./auth.layout.html",
})
export default class AuthLayout {
  private readonly route = inject(ActivatedRoute);
  private readonly activePageData = () =>
    this.route.firstChild?.snapshot?.data as AuthPageData | undefined;

  protected readonly page = toSignal(
    inject(Router).events.pipe(filter((event) => event instanceof NavigationEnd), map(() => this.activePageData())),
    { initialValue: this.activePageData() }
  );
}
