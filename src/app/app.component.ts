import { Component } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestOptions, URLSearchParams } from '@angular/http';
import { JsonServiceService } from './json-service.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonServiceService]
})
export class AppComponent {

  constructor(private http: HttpClient, private service: JsonServiceService) {
    this.service.getFiles().subscribe(data => {
      this.data = data;
      console.log(this.data[0]);
      }
    );
  }

  url = 'http://localhost:8081/';
  uploadUrl = 'http://localhost:8081/upload';
  parserUrl = 'http://localhost:8081/parser';
  deleteUrl = 'http://localhost:8081/delete';

  data: Observable<Array<any>>;

  getPage(): void {
    this.http.get(this.url, { responseType: 'text' }).subscribe(res => {
      console.log(res);
    });
  }

  delete(date: string): void {
    console.log(date); // i have date to delete
    const params = new HttpParams();
    params.append('dateToDelete', date);
    const req = new HttpRequest('GET', this.deleteUrl + '?dateToDelete=' + date);
    this.http.request(req).subscribe();
  }

  fileChange(event): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file = fileList[0];
      console.log(file.lastModifiedDate);
      const formData = new FormData();
      const date: Date = new Date(file.lastModifiedDate);
      console.log(date.toISOString());
      const data: string = date.toISOString();
      formData.append('date', data);
      formData.append('file', file, file.name);

      const req = new HttpRequest('POST', this.uploadUrl, formData, {
        reportProgress: true
      });

      // tslint:disable-next-line:no-shadowed-variable
      this.http.request(req).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          const valueelem = (<HTMLInputElement>document.getElementById('progressBar'));
          valueelem.value = String(Math.round(percentDone));
          console.log(`File is ${percentDone}% uploaded.`);
        } else if (event instanceof HttpResponse) {
          // po resp
          const valueelem = (<HTMLInputElement>document.getElementById('progressBar'));
          valueelem.value = String(0);
          console.log('File is completely uploaded!');
        }
      }
      );
    }
  }
}
