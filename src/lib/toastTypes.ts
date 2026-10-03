export interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}
