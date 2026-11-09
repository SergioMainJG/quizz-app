import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import Image from "../../components/image/image";

@Component({
  imports: [RouterLink, Image],
  selector: "app-homepage",
  templateUrl: "./homepage.html",
})
export default class Homepage {
  protected readonly year = new Date().getFullYear();
}