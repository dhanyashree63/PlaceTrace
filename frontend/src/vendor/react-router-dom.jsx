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

export function BrowserRouter({ children }) {
  const [loc, setLoc] = useState(() => ({
    pathname: window.location.pathname || "/",
    search: window.location.search || "",
  }));

  useEffect(() => {
    const onPopState = () => {
      setLoc({
        pathname: window.location.pathname || "/",
        search: window.location.search || "",
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    const parsed = parsePathAndSearch(String(to));
    const full = parsed.pathname + parsed.search;
    if (options.replace) {
      window.history.replaceState({}, "", full);
    } else {
      window.history.pushState({}, "", full);
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
  return (
    <a
      href={to}
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

  return (
    <a
      href={to}
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
