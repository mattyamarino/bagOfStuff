import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExternalUrl } from 'src/app/config/ExternalUrl';
import { ExternalItem } from 'src/app/models/ExternalItem';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  jsonFormat: string = '?format=json&search=';


  constructor(private http: HttpClient) { }

  getMagicItems(query: string) {
    return this.http.get<any>(ExternalUrl.magicItemUrl + this.jsonFormat + query);
  }

  getScrolls(query: string) {
    return this.http.get<any>(ExternalUrl.scrollUrl + this.jsonFormat + query);
  }

  getWeapons(query: string) {
    return this.http.get<any>(ExternalUrl.weaponUrl + this.jsonFormat + query);
  }

  getGemstones() {
    return this.http.get("assets/gemstones.json");
  }
}
