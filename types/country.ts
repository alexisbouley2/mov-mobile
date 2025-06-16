// types/country.ts
export interface Country {
  name: string;
  code: string; // ISO 2-letter code
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
}
