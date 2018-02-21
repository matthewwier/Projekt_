import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestOptions, URLSearchParams } from '@angular/http';

@Injectable()
export class JsonServiceService {

  constructor(private http: HttpClient) { }

  getFiles(): Observable<any>{
    return this.http.get('../assets/sars.json');
  }
}
