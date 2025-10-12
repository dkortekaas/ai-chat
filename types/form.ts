export interface ContactForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  enabled: boolean;
  redirectUrl?: string;
}

export interface FormField {
  id: string;
  name: string;
  type: "text" | "email" | "phone" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}
