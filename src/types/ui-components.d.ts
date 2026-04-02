import * as React from 'react';

declare module '@/components/ui/button' {
  export const Button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
      asChild?: boolean;
      children?: React.ReactNode;
    } & React.RefAttributes<HTMLButtonElement>
  >;
  export const buttonVariants: (props?: any) => string;
}

declare module '@/components/ui/card' {
  export const Card: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const CardHeader: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const CardTitle: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLHeadingElement>
  >;
  export const CardDescription: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLParagraphElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLParagraphElement>
  >;
  export const CardContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const CardFooter: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@/components/ui/input' {
  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;
}

declare module '@/components/ui/textarea' {
  export const Textarea: React.ForwardRefExoticComponent<
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>
  >;
}

declare module '@/components/ui/badge' {
  export const Badge: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { variant?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@/components/ui/label' {
  export const Label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module '@/components/ui/switch' {
  export const Switch: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
    } & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module '@/components/ui/checkbox' {
  export const Checkbox: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
    } & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module '@/components/ui/progress' {
  export const Progress: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      value?: number;
      max?: number;
    } & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@/components/ui/slider' {
  export const Slider: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      value?: number[];
      onValueChange?: (value: number[]) => void;
      min?: number;
      max?: number;
      step?: number;
    } & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@/components/ui/tabs' {
  export const Tabs: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void; defaultValue?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const TabsList: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const TabsTrigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; children?: React.ReactNode } & React.RefAttributes<HTMLButtonElement>
  >;
  export const TabsContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { value: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@/components/ui/select' {
  export const Select: React.FC<{ value?: string; onValueChange?: (value: string) => void; children?: React.ReactNode }>;
  export const SelectTrigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLButtonElement>
  >;
  export const SelectContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectItem: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { value: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectValue: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string } & React.RefAttributes<HTMLSpanElement>
  >;
}

declare module '@/components/ui/futuristic-cloud' {
  export const FuturisticOrb: React.FC<any>;
  export const FuturisticCloud: React.FC<any>;
}
