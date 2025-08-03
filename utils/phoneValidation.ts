// utils/phoneValidation.ts
import { Country } from "@/types/country";

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
}

// Normalize phone numbers for comparison
export function normalizePhoneNumber(
  phoneNumber: string,
  userCountryCode: string = "+33"
): string {
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Handle different formats
  if (cleaned.startsWith("0")) {
    // Convert 06... to +336...
    cleaned = userCountryCode + cleaned.substring(1);
  } else if (!cleaned.startsWith("+")) {
    // Add user's country code
    cleaned = userCountryCode + cleaned;
  }
  // remove the + from the beginning to compare in the database
  return cleaned.substring(1, cleaned.length);
}

export function validatePhoneNumber(
  phoneNumber: string,
  country: Country
): PhoneValidationResult {
  // Remove all non-digit characters
  const cleanedNumber = phoneNumber.replace(/\D/g, "");

  // Check if number is empty
  if (!cleanedNumber) {
    return {
      isValid: false,
      error: "Phone number is required",
    };
  }

  // Check length constraints
  if (cleanedNumber.length < country.minLength) {
    return {
      isValid: false,
      error: `Phone number must be at least ${country.minLength} digits`,
    };
  }

  if (cleanedNumber.length > country.maxLength) {
    return {
      isValid: false,
      error: `Phone number cannot exceed ${country.maxLength} digits`,
    };
  }

  // Country-specific validation
  const countryValidation = validateByCountry(cleanedNumber, country);
  if (!countryValidation.isValid) {
    return countryValidation;
  }

  // Format the complete number
  const formattedNumber = normalizePhoneNumber(cleanedNumber, country.dialCode);

  return {
    isValid: true,
    formattedNumber,
  };
}

function validateByCountry(
  number: string,
  country: Country
): PhoneValidationResult {
  switch (country.code) {
    case "US":
    case "CA":
      // North American Numbering Plan
      if (number.length !== 10) {
        return { isValid: false, error: "Phone number must be 10 digits" };
      }
      if (number[0] === "0" || number[0] === "1") {
        return {
          isValid: false,
          error: "Phone number cannot start with 0 or 1",
        };
      }
      if (number[3] === "0" || number[3] === "1") {
        return {
          isValid: false,
          error: "Area code cannot start with 0 or 1",
        };
      }
      break;

    case "FR":
      if (number.length === 9) {
        if (!number.startsWith("6") && !number.startsWith("7")) {
          return {
            isValid: false,
            error: "Mobile number must start with 6 or 7",
          };
        }
      } else if (number.length === 10) {
        if (!number.startsWith("06") && !number.startsWith("07")) {
          return {
            isValid: false,
            error: "Mobile number must start with 06 or 07",
          };
        }
      } else {
        return {
          isValid: false,
          error: "Phone number must be 9 or 10 digits",
        };
      }
      break;

    case "GB":
      // UK mobile numbers start with 7
      if (number.length !== 10) {
        return { isValid: false, error: "Phone number must be 10 digits" };
      }
      if (!number.startsWith("7")) {
        return {
          isValid: false,
          error: "Mobile number must start with 7",
        };
      }
      break;

    case "DE":
      // German mobile numbers start with 15, 16, or 17
      if (number.length < 10 || number.length > 12) {
        return {
          isValid: false,
          error: "Phone number must be 10-12 digits",
        };
      }
      if (
        !number.startsWith("15") &&
        !number.startsWith("16") &&
        !number.startsWith("17")
      ) {
        return {
          isValid: false,
          error: "Mobile number must start with 15, 16, or 17",
        };
      }
      break;

    case "IN":
      // Indian mobile numbers start with 6, 7, 8, or 9
      if (number.length !== 10) {
        return { isValid: false, error: "Phone number must be 10 digits" };
      }
      if (!/^[6789]/.test(number)) {
        return {
          isValid: false,
          error: "Mobile number must start with 6, 7, 8, or 9",
        };
      }
      break;

    case "AU":
      // Australian mobile numbers start with 4
      if (number.length !== 9) {
        return { isValid: false, error: "Phone number must be 9 digits" };
      }
      if (!number.startsWith("4")) {
        return {
          isValid: false,
          error: "Mobile number must start with 4",
        };
      }
      break;

    case "BR":
      // Brazilian mobile numbers
      if (number.length !== 11) {
        return { isValid: false, error: "Phone number must be 11 digits" };
      }
      if (!number.startsWith("9")) {
        return {
          isValid: false,
          error: "Mobile number must start with 9",
        };
      }
      break;

    case "JP":
      // Japanese mobile numbers start with 80 or 90
      if (number.length !== 11) {
        return { isValid: false, error: "Phone number must be 11 digits" };
      }
      if (!number.startsWith("80") && !number.startsWith("90")) {
        return {
          isValid: false,
          error: "Mobile number must start with 80 or 90",
        };
      }
      break;

    case "CN":
      // Chinese mobile numbers
      if (number.length !== 11) {
        return { isValid: false, error: "Phone number must be 11 digits" };
      }
      if (!/^1[3-9]/.test(number)) {
        return {
          isValid: false,
          error: "Mobile number must start with 13-19",
        };
      }
      break;

    case "RU":
      // Russian mobile numbers start with 9
      if (number.length !== 10) {
        return { isValid: false, error: "Phone number must be 10 digits" };
      }
      if (!number.startsWith("9")) {
        return {
          isValid: false,
          error: "Mobile number must start with 9",
        };
      }
      break;

    default:
      // Generic validation for other countries
      if (
        number.length < country.minLength ||
        number.length > country.maxLength
      ) {
        return {
          isValid: false,
          error: `Phone number must be ${country.minLength}-${country.maxLength} digits`,
        };
      }
      break;
  }

  return { isValid: true };
}

export function formatPhoneNumberForDisplay(
  number: string,
  country: Country
): string {
  const cleanedNumber = number.replace(/\D/g, "");

  switch (country.code) {
    case "US":
    case "CA":
      // Format as (XXX) XXX-XXXX
      if (cleanedNumber.length === 10) {
        return `(${cleanedNumber.slice(0, 3)}) ${cleanedNumber.slice(
          3,
          6
        )}-${cleanedNumber.slice(6)}`;
      }
      break;

    case "FR":
      // Format as X XX XX XX XX (1 digit, then groups of 2)
      if (cleanedNumber.length === 9) {
        return `${cleanedNumber.slice(0, 1)} ${cleanedNumber.slice(
          1,
          3
        )} ${cleanedNumber.slice(3, 5)} ${cleanedNumber.slice(
          5,
          7
        )} ${cleanedNumber.slice(7)}`;
      }
      if (cleanedNumber.length === 10) {
        return `${cleanedNumber.slice(0, 2)} ${cleanedNumber.slice(
          2,
          4
        )} ${cleanedNumber.slice(4, 6)} ${cleanedNumber.slice(
          6,
          8
        )} ${cleanedNumber.slice(8)}`;
      }
      break;

    case "GB":
      // Format as XXXX XXX XXX
      if (cleanedNumber.length === 10) {
        return `${cleanedNumber.slice(0, 4)} ${cleanedNumber.slice(
          4,
          7
        )} ${cleanedNumber.slice(7)}`;
      }
      break;

    case "DE":
      // Format as XXX XXXXXXXX (3 digits, then 8 digits)
      if (cleanedNumber.length >= 10) {
        return `${cleanedNumber.slice(0, 3)} ${cleanedNumber.slice(3)}`;
      }
      break;

    case "IN":
      // Format as XXXXX XXXXX (5 digits, then 5 digits)
      if (cleanedNumber.length === 10) {
        return `${cleanedNumber.slice(0, 5)} ${cleanedNumber.slice(5)}`;
      }
      break;

    case "AU":
      // Format as XXXX XXX XXX (4 digits, then 3, then 3)
      if (cleanedNumber.length === 9) {
        return `${cleanedNumber.slice(0, 4)} ${cleanedNumber.slice(
          4,
          7
        )} ${cleanedNumber.slice(7)}`;
      }
      break;

    case "BR":
      // Format as (XX) XXXXX-XXXX (2 digits, then 5, then 4)
      if (cleanedNumber.length === 11) {
        return `(${cleanedNumber.slice(0, 2)}) ${cleanedNumber.slice(
          2,
          7
        )}-${cleanedNumber.slice(7)}`;
      }
      break;

    case "JP":
      // Format as XXX-XXXX-XXXX (3 digits, then 4, then 4)
      if (cleanedNumber.length === 11) {
        return `${cleanedNumber.slice(0, 3)}-${cleanedNumber.slice(
          3,
          7
        )}-${cleanedNumber.slice(7)}`;
      }
      break;

    case "CN":
      // Format as XXX XXXX XXXX (3 digits, then 4, then 4)
      if (cleanedNumber.length === 11) {
        return `${cleanedNumber.slice(0, 3)} ${cleanedNumber.slice(
          3,
          7
        )} ${cleanedNumber.slice(7)}`;
      }
      break;

    case "RU":
      // Format as (XXX) XXX-XX-XX (3 digits, then 3, then 2, then 2)
      if (cleanedNumber.length === 10) {
        return `(${cleanedNumber.slice(0, 3)}) ${cleanedNumber.slice(
          3,
          6
        )}-${cleanedNumber.slice(6, 8)}-${cleanedNumber.slice(8)}`;
      }
      break;

    default:
      // Default formatting - add spaces every 3 digits
      return cleanedNumber.replace(/(\d{3})(?=\d)/g, "$1 ");
  }

  return cleanedNumber;
}
