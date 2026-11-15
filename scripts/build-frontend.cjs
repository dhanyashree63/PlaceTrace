const fs = require("fs");
const path = require("path");

const IDE_NODE_MODULES =
  "C:\\Users\\HP\\AppData\\Local\\Programs\\Antigravity IDE\\resources\\app\\node_modules";

module.paths.unshift(IDE_NODE_MODULES);

const ts = require("typescript");
const { rollup } = require("rollup");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");

const ROOT_DIR = path.resolve(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const SRC_DIR = path.join(FRONTEND_DIR, "src");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const ASSETS_DIR = path.join(DIST_DIR, "assets");

function resolveLocalFile(candidateBase) {
  const exts = ["", ".jsx", ".js", ".tsx", ".ts", "/index.jsx", "/index.js"];
  for (const ext of exts) {
    const full = candidateBase + ext;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return full;
    }
  }
  return null;
}

async function buildFrontend() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  console.log("[1/3] Compiling Tailwind CSS...");
  const cssInputPath = path.join(SRC_DIR, "index.css");
  const cssRaw = fs.readFileSync(cssInputPath, "utf8");
  const twConfig = {
    content: [
      path.join(FRONTEND_DIR, "index.html").replace(/\\/g, "/"),
      path.join(SRC_DIR, "**/*.{js,jsx}").replace(/\\/g, "/"),
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        },
        colors: {
          navy: {
            deep: "#111936",
            sidebar: "#172044",
            text: "#182044",
          },
          brand: {
            purple: "#6555F5",
            bright: "#7C5CFF",
            soft: "#EEEAFE",
            lavender: "#F4F5FF",
          },
          muted: "#66708F",
          status: {
            success: "#32B67A",
            warning: "#F4B942",
            error: "#E55353",
          },
        },
        boxShadow: {
          card: "0 4px 20px -2px rgba(24, 32, 68, 0.06), 0 2px 6px -1px rgba(24, 32, 68, 0.03)",
          hover: "0 10px 25px -4px rgba(101, 85, 245, 0.14), 0 4px 10px -2px rgba(24, 32, 68, 0.05)",
          nav: "0 6px 18px -2px rgba(101, 85, 245, 0.42)",
        },
      },
    },
  };

  const cssResult = await postcss([tailwindcss(twConfig)]).process(cssRaw, {
    from: cssInputPath,
    to: path.join(ASSETS_DIR, "index.css"),
  });
  fs.writeFileSync(path.join(ASSETS_DIR, "index.css"), cssResult.css, "utf8");

  console.log("[2/3] Bundling React + Lucide + PlaceTrace JSX modules...");

  const customPlugin = {
    name: "placetrace-resolver-and-jsx",
    resolveId(source, importer) {
      if (source.endsWith(".css")) {
        return "\0empty-css";
      }
      if (source === "react" || source === "react-dom" || source === "preact/compat") {
        return path.join(IDE_NODE_MODULES, "preact", "compat", "dist", "compat.mjs");
      }
      if (source === "react-dom/client" || source === "preact/compat/client") {
        return path.join(IDE_NODE_MODULES, "preact", "compat", "client.mjs");
      }
      if (source === "preact/hooks") {
        return path.join(IDE_NODE_MODULES, "preact", "hooks", "dist", "hooks.mjs");
      }
      if (source === "preact") {
        return path.join(IDE_NODE_MODULES, "preact", "dist", "preact.mjs");
      }
      if (source === "react-router-dom") {
        return path.join(SRC_DIR, "vendor", "react-router-dom.jsx");
      }
      if (source === "recharts") {
        return path.join(SRC_DIR, "vendor", "recharts.jsx");
      }
      if (source === "lucide-react") {
        return path.join(
          IDE_NODE_MODULES,
          "lucide-react",
          "dist",
          "esm",
          "lucide-react.js"
        );
      }
      if (source.startsWith(".")) {
        const baseDir = importer ? path.dirname(importer) : SRC_DIR;
        const resolved = resolveLocalFile(path.resolve(baseDir, source));
        if (resolved) return resolved;
      }
      return null;
    },
    load(id) {
      if (id === "\0empty-css") {
        return "export default {};";
      }
      if (id.endsWith(".jsx") || id.endsWith(".js") || id.endsWith(".mjs")) {
        let code = fs.readFileSync(id, "utf8");
        if (id.endsWith(".mjs")) {
          return code;
        }
        code = code.replace(/import\.meta\.env\?\.VITE_API_BASE_URL/g, '"/api"');
        const transpiled = ts.transpileModule(code, {
          fileName: id,
          compilerOptions: {
            jsx: ts.JsxEmit.React,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2020,
            allowJs: true,
          },
        });
        return transpiled.outputText;
      }
      return null;
    },
  };

  const bundle = await rollup({
    input: path.join(SRC_DIR, "main.jsx"),
    plugins: [customPlugin],
    onwarn(warning, warn) {
      if (warning.code === "THIS_IS_UNDEFINED") return;
      warn(warning);
    },
  });

  const { output } = await bundle.generate({
    format: "iife",
    name: "PlaceTraceApp",
  });

  fs.writeFileSync(path.join(ASSETS_DIR, "index.js"), output[0].code, "utf8");

  const ROOT_ASSETS_DIR = path.join(ROOT_DIR, "assets");
  fs.mkdirSync(ROOT_ASSETS_DIR, { recursive: true });
  fs.writeFileSync(path.join(ROOT_ASSETS_DIR, "index.css"), cssResult.css, "utf8");
  fs.writeFileSync(path.join(ROOT_ASSETS_DIR, "index.js"), output[0].code, "utf8");

  console.log("[3/3] Writing production index.html files...");
  const makeHtml = (assetPrefix = "./assets") => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PlaceTrace — Track. Prepare. Get Placed.</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${assetPrefix}/index.css" />
  </head>
  <body class="bg-[#F4F5FF] text-[#182044] antialiased selection:bg-[#6555F5] selection:text-white">
    <div id="root"></div>
    <script src="${assetPrefix}/index.js"></script>
  </body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, "index.html"), makeHtml("./assets"), "utf8");
  fs.writeFileSync(path.join(ROOT_DIR, "index.html"), makeHtml("./assets"), "utf8");
  fs.writeFileSync(path.join(FRONTEND_DIR, "index.html"), makeHtml("./dist/assets"), "utf8");
  console.log("Frontend build completed successfully!");
}

buildFrontend().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
