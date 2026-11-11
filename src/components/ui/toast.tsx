"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  XIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}
function ToastWave({ type }: { type?: string }) {
  const colors: Record<string, string> = {
    success: "text-green-500/25",
    error: "text-red-500/20",
    warning: "text-amber-500/25",
    info: "text-blue-500/20",
    loading: "text-zinc-400/20",
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 320"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute -left-[31px] top-[32px] h-auto w-20 rotate-90 fill-current",
        colors[type ?? "info"] ?? colors.info,
      )}
    >
      <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L0,320Z" />
    </svg>
  );
}
function ToastIcon({ type }: { type: string | undefined }) {
  const config = {
    success: {
      icon: CircleCheckIcon,
      background: "bg-green-100",
      color: "text-green-700",
    },
    error: {
      icon: OctagonXIcon,
      background: "bg-red-100",
      color: "text-red-600",
    },
    warning: {
      icon: TriangleAlertIcon,
      background: "bg-amber-100",
      color: "text-amber-600",
    },
    info: {
      icon: InfoIcon,
      background: "bg-blue-100",
      color: "text-blue-600",
    },
    loading: {
      icon: Loader2Icon,
      background: "bg-zinc-100",
      color: "text-zinc-600",
    },
  };

  const item = config[type as keyof typeof config];

  if (!item) return null;

  const Icon = item.icon;

  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full",
        item.background,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-5",
          item.color,
          type === "loading" && "animate-spin",
        )}
        strokeWidth={2}
      />
    </span>
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
   <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 top-0 z-[calc(1000-var(--toast-index))] w-full origin-top overflow-hidden rounded-xl border border-zinc-100 bg-white text-zinc-900 shadow-[0_8px_24px_rgba(149,157,165,0.2)] will-change-transform outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50",

        // Giữ nguyên animation Base UI
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",

        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",

        "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",

        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",

        "data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)]",

        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",

        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",

        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",

        className,
      )}
      {...props}
    />
  );
}


//  <ToastPrimitive.Root
//       data-slot="toast"
//       className={cn(
//         "group/toast pointer-events-auto absolute right-0 top-0 z-[calc(1000-var(--toast-index))] w-full origin-top rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
//         "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
//         "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
//         "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
//         "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
//         "data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)]",
//         "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
//         "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
//         "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
//         "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
//         "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
//         "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
//         "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
//         "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
//         "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",

//         "data-[type=success]:border-green-300",
//         "data-[type=success]:bg-green-200",
//         "data-[type=success]:text-green-900",

//         "data-[type=error]:border-red-300",
//         "data-[type=error]:bg-red-50",
//         "data-[type=error]:text-red-900",

//         "data-[type=warning]:border-amber-300",
//         "data-[type=warning]:bg-amber-50",
//         "data-[type=warning]:text-amber-900",
//         className,
//       )}
//       {...props}
//     />

// function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
//   return (
//     <ToastPrimitive.Content
//       data-slot="toast-content"
//       className={cn(
//         "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
//         className,
//       )}
//       {...props}
//     />
//   );
// }

// function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
//   return (
//     <ToastPrimitive.Title
//       data-slot="toast-title"
//       className={cn("text-sm font-medium", className)}
//       {...props}
//     />
//   );
// }
function ToastTitle({
  className,
  ...props
}: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn(
        "text-sm font-semibold",
        "group-data-[type=success]/toast:text-green-700",
        "group-data-[type=error]/toast:text-red-700",
        "group-data-[type=warning]/toast:text-amber-700",
        "group-data-[type=info]/toast:text-blue-700",
        className,
      )}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

// function ToastIcon({ type }: { type: string | undefined }) {
//   let icon: React.ReactNode = null;

//   if (type === "success") {
//     icon = <CircleCheckIcon aria-hidden="true" />;
//   }

//   if (type === "info") {
//     icon = <InfoIcon aria-hidden="true" />;
//   }

//   if (type === "warning") {
//     icon = <TriangleAlertIcon aria-hidden="true" />;
//   }

//   if (type === "error") {
//     icon = <OctagonXIcon className="text-destructive" aria-hidden="true" />;
//   }

//   if (type === "loading") {
//     icon = <Loader2Icon className="animate-spin" aria-hidden="true" />;
//   }

//   if (!icon) {
//     return null;
//   }

//   return (
//     <span
//       data-slot="toast-icon"
//       className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
//     >
//       {icon}
//     </span>
//   );
// }
function ToastContent({
  className,
  ...props
}: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "relative flex h-full min-h-20 items-center gap-2.5 overflow-hidden px-3 py-1 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}
// function ToastList() {
//   const { toasts } = ToastPrimitive.useToastManager();

//   return toasts.map((toastItem) => (
//     <Toast key={toastItem.id} toast={toastItem}>
//       <ToastContent>
//         <ToastIcon type={toastItem.type} />
//         <div className="flex min-w-0 flex-1 flex-col gap-1">
//           <ToastTitle />
//           <ToastDescription />
//         </div>
//         <ToastAction />
//         <ToastClose />
//       </ToastContent>
//     </Toast>
//   ));
// }
function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastWave type={toastItem.type} />

        <ToastIcon type={toastItem.type} />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle
            className={cn(
              "text-[15px] font-bold",
              "group-data-[type=success]/toast:text-green-700",
              "group-data-[type=error]/toast:text-red-700",
              "group-data-[type=warning]/toast:text-amber-700",
              "group-data-[type=info]/toast:text-blue-700",
            )}
          />

          <ToastDescription className="text-xs leading-5 text-zinc-600" />
        </div>

        <ToastAction />

        <ToastClose
          render={
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Đóng thông báo"
            />
          }
        />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
