import { kAppAccountPaths } from "../definitions/paths/account.ts";
import { kAppInternalPaths } from "../definitions/paths/internal.ts";
import { kAppRootPaths } from "../definitions/paths/root.ts";

// Render WebHeader for these routes starting with these paths
const webRoutes = [
  kAppAccountPaths.signup,
  kAppAccountPaths.login,
  kAppAccountPaths.changePassword,
  kAppAccountPaths.forgotPassword,
  kAppAccountPaths.verifyEmail,
];
const noHeaderRoutes = [kAppInternalPaths.waitlist];
const routeToAppOnInitRoutes = [
  // appRootPaths.home,
  kAppAccountPaths.signup,
  kAppAccountPaths.login,
];

export function isWebPath(pathname: string) {
  return (
    pathname === kAppRootPaths.home ||
    pathname === kAppRootPaths.pricing ||
    pathname.startsWith(`${kAppRootPaths.pricing}/`) ||
    webRoutes.some((r) => {
      return pathname.startsWith(r);
    })
  );
}
export function isInternalPath(pathname: string) {
  return pathname.startsWith(`${kAppRootPaths.internal}/`);
}
export function isNoHeaderPath(pathname: string) {
  return noHeaderRoutes.some((r) => {
    return pathname.startsWith(r);
  });
}
export function isRouteToAppOnInitPath(pathname: string) {
  return (
    pathname === kAppRootPaths.home ||
    routeToAppOnInitRoutes.some((r) => {
      return pathname.startsWith(r);
    })
  );
}
