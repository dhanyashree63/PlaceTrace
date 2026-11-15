import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const RouterContext = createContext(null);
const RouteParamsContext = createContext({});

function parsePathAndSearch(fullUrl = "/") {
  const idx = fullUrl.indexOf("?");
  if (idx === -1) {
    return { pathname: fullUrl || "/", search: "" };
  }
  return {
    pathname: fullUrl.slice(0, idx) || "/",
    search: fullUrl.slice(idx),
  };
}

const VALID_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/jobs",
  "/profile",
  "/study-planner",
  "/practice",
  "/projects",
  "/resources",
  "/resume",
  "/skill-gap",
  "/applications",
  "/analytics",
  "/settings",
  "/tpo",
  "/admin-portal",
];

function isValidAppRoute(path) {
  if (!path || path === "/") return true;
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return true;
  return VALID_ROUTE_PREFIXES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`)
  );
}

function useHashMode() {
  if (typeof window === "undefined") return false;
  const host = (window.location?.hostname || "").toLowerCase();
  const proto = window.location?.protocol || "";
  const path = window.location?.pathname || "";
  return (
    proto === "file:" ||
    path.endsWith(".html") ||
    host.includes("githack.com") ||
    host.includes("github.io") ||
    host.includes("githubusercontent.com")
  );
}

function getCurrentLocation() {
  if (typeof window === "undefined") return { pathname: "/", search: "" };
  const rawHash = window.location.hash || "";

  // If the hash is a route hash like #/login or #/dashboard
  if (rawHash.startsWith("#/")) {
    const routeCandidate = rawHash.slice(1) || "/";
    if (isValidAppRoute(routeCandidate)) {
      return parsePathAndSearch(routeCandidate);
    }
    return { pathname: "/", search: "" };
  }

  // If hash is an in-page section anchor like #features, #about, #contact, #home
  if (rawHash.startsWith("#") && rawHash.length > 1) {
    return { pathname: "/", search: "" };
  }

  if (useHashMode()) {
    return { pathname: "/", search: "" };
  }

  const currentPath = window.location.pathname || "/";
  if (isValidAppRoute(currentPath)) {
    return {
      pathname: currentPath,
      search: window.location.search || "",
    };
  }
  return { pathname: "/", search: "" };
}

export function BrowserRouter({ children }) {
  const [loc, setLoc] = useState(() => getCurrentLocation());

  useEffect(() => {
    const onUrlChange = () => {
      const rawHash = window.location.hash || "";
      if (rawHash.startsWith("#") && !rawHash.startsWith("#/") && rawHash.length > 1) {
        const el = document.getElementById(rawHash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      setLoc(getCurrentLocation());
    };
    window.addEventListener("popstate", onUrlChange);
    window.addEventListener("hashchange", onUrlChange);
    return () => {
      window.removeEventListener("popstate", onUrlChange);
      window.removeEventListener("hashchange", onUrlChange);
    };
  }, []);

  const navigate = useCallback((to, options = {}) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    const parsed = parsePathAndSearch(String(to));
    const full = parsed.pathname + parsed.search;
    if (useHashMode()) {
      const targetHash = `#${full.startsWith("/") ? full : `/${full}`}`;
      try {
        if (options.replace) {
          window.history.replaceState({}, "", targetHash);
        } else {
          window.location.hash = targetHash;
        }
      } catch {
        // Ignore history security errors on sandboxed origins
      }
    } else {
      try {
        if (options.replace) {
          window.history.replaceState({}, "", full);
        } else {
          window.history.pushState({}, "", full);
        }
      } catch {
        // Ignore history errors
      }
    }
    setLoc(parsed);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const value = useMemo(() => ({ ...loc, navigate }), [loc, navigate]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

export function MemoryRouter({ initialEntries = ["/"], children }) {
  const [loc, setLoc] = useState(() => parsePathAndSearch(initialEntries[0] || "/"));

  const navigate = useCallback((to) => {
    setLoc(parsePathAndSearch(String(to)));
  }, []);

  const value = useMemo(() => ({ ...loc, navigate }), [loc, navigate]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.navigate : () => {};
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  return ctx ? { pathname: ctx.pathname, search: ctx.search } : { pathname: "/", search: "" };
}

export function useParams() {
  return useContext(RouteParamsContext) || {};
}

export function useSearchParams() {
  const ctx = useContext(RouterContext);
  const searchParams = useMemo(() => new URLSearchParams(ctx?.search || ""), [ctx?.search]);

  const setSearchParams = useCallback(
    (nextInit) => {
      if (!ctx) return;
      const nextParams =
        typeof nextInit === "function"
          ? nextInit(new URLSearchParams(ctx.search))
          : new URLSearchParams(nextInit);
      const q = nextParams.toString();
      ctx.navigate(q ? `${ctx.pathname}?${q}` : ctx.pathname, { replace: true });
    },
    [ctx]
  );

  return [searchParams, setSearchParams];
}

function matchRoutePattern(pattern, pathname) {
  if (pattern === "*") return { matched: true, params: {} };
  const normPattern = pattern.replace(/\/+$/, "") || "/";
  const normPath = pathname.replace(/\/+$/, "") || "/";

  const patternParts = normPattern.split("/");
  const pathParts = normPath.split("/");

  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const actual = pathParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(actual);
    } else if (p !== actual) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}

export function Routes({ children }) {
  const { pathname } = useLocation();
  const childArray = React.Children.toArray(children);

  for (const child of childArray) {
    if (!React.isValidElement(child)) continue;
    const { path = "/", element } = child.props;
    const res = matchRoutePattern(path, pathname);
    if (res.matched) {
      return (
        <RouteParamsContext.Provider value={res.params}>
          {element}
        </RouteParamsContext.Provider>
      );
    }
  }
  return null;
}

export function Route() {
  return null;
}

export function Navigate({ to, replace = false }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
}

export function Link({ to, children, className = "", onClick, ...rest }) {
  const navigate = useNavigate();
  const safeHref = useHashMode() ? `#${String(to).startsWith("/") ? to : `/${to}`}` : to;
  return (
    <a
      href={safeHref}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function NavLink({ to, children, className, onClick, ...rest }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive =
    pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));
  const computedClass =
    typeof className === "function" ? className({ isActive }) : className || "";
  const safeHref = useHashMode() ? `#${String(to).startsWith("/") ? to : `/${to}`}` : to;

  return (
    <a
      href={safeHref}
      className={computedClass}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
