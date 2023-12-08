import { TestBed } from '@angular/core/testing';

import { AuthStrapiService } from './auth-strapi.service';

describe('AuthStrapiService', () => {
  let service: AuthStrapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStrapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
