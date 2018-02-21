import { TestBed, inject } from '@angular/core/testing';

import { JsonServiceService } from './json-service.service';

describe('JsonServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonServiceService]
    });
  });

  it('should be created', inject([JsonServiceService], (service: JsonServiceService) => {
    expect(service).toBeTruthy();
  }));
});
