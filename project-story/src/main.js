import mermaid from "mermaid";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  createIcons,
  Database,
  ExternalLink,
  Globe2,
  LockKeyhole,
  Monitor,
  MonitorSmartphone,
  Network,
  PanelsTopLeft,
  Play,
  RefreshCw,
  ServerCog,
  ShieldCheck
} from "lucide";
import "./style.css";

const icons = {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Database,
  ExternalLink,
  Globe2,
  LockKeyhole,
  Monitor,
  MonitorSmartphone,
  Network,
  PanelsTopLeft,
  Play,
  RefreshCw,
  ServerCog,
  ShieldCheck
};

const diagrams = {
  runtime: {
    note: "访客与管理员使用不同入口，但最终都由 NocoBase 的数据和权限规则支撑。",
    code: `flowchart LR
      V[访客浏览器] -->|HTTPS| CF[Cloudflare Tunnel]
      CF --> WEB[Next.js 公开网站]
      WEB -->|最小权限 API Token| NB[NocoBase REST API]
      NB --> DB[(NocoBase MySQL)]
      A[管理员浏览器] -->|HTTPS| CF
      CF --> ADMIN[NocoBase 管理后台]
      ADMIN --> NB`
  },
  content: {
    note: "文章发布后，前台只读取状态为已发布且未删除的内容。",
    code: `flowchart LR
      A[管理员编辑文章] --> B[NocoBase 保存]
      B --> C[(MySQL)]
      D[访客刷新页面] --> E[Next.js 请求 API]
      E --> F{已发布且未删除?}
      F -->|是| G[展示最新文章]
      F -->|否| H[不公开]`
  },
  feedback: {
    note: "评论创建与评论批准使用不同权限，网站 Token 无法把新评论直接设为已通过。",
    code: `flowchart LR
      V[访客提交评论] --> P[PENDING 待审核]
      P --> A[管理员在 NocoBase 审核]
      A --> D{审核决定}
      D -->|APPROVED| S[前台公开展示]
      D -->|REJECTED| H[保持隐藏]`
  }
};

const concepts = {
  frontstage: [
    { icon: "globe-2", title: "前台", text: "访客使用的公开网站：查看个人介绍、文章与已通过评论。" },
    { icon: "panels-top-left", title: "后台", text: "管理员使用的 NocoBase：维护资料、文章，并审核评论。" }
  ],
  engineering: [
    { icon: "monitor-smartphone", title: "前端", text: "浏览器中能看到和操作的界面代码。前台和后台都各自拥有前端界面。" },
    { icon: "server-cog", title: "后端", text: "接收请求、检查权限、执行规则并读写数据的服务。本项目主要由 Next.js 服务端与 NocoBase API 承担。" }
  ],
  data: [
    { icon: "database", title: "数据库", text: "负责可靠保存和查询文章、资料、评论等记录，但不决定页面怎样展示。" },
    { icon: "network", title: "后端服务", text: "位于页面与数据库之间，执行权限和业务规则，并把合适的数据返回给前端。" }
  ]
};

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "strict",
  themeVariables: {
    fontFamily: 'Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif',
    primaryColor: "#e8f2e9",
    primaryTextColor: "#18201b",
    primaryBorderColor: "#174f3a",
    lineColor: "#2f5bd3",
    secondaryColor: "#c7f36b",
    tertiaryColor: "#f4f2ed"
  },
  flowchart: { curve: "basis", htmlLabels: true }
});

createIcons({ icons });

let renderCount = 0;
async function renderDiagram(key) {
  const target = document.querySelector("#architecture-diagram");
  const note = document.querySelector("#diagram-note");
  const selected = diagrams[key];
  renderCount += 1;
  const { svg, bindFunctions } = await mermaid.render(`architecture-${renderCount}`, selected.code);
  target.innerHTML = svg;
  target.removeAttribute("data-processed");
  bindFunctions?.(target);
  note.textContent = selected.note;
}

function renderConcept(key) {
  const target = document.querySelector("#concept-content");
  const [left, right] = concepts[key];
  target.innerHTML = `
    <article class="concept-side">
      <span class="concept-icon"><i data-lucide="${left.icon}"></i></span>
      <h3>${left.title}</h3><p>${left.text}</p>
    </article>
    <div class="concept-divider">对比</div>
    <article class="concept-side">
      <span class="concept-icon"><i data-lucide="${right.icon}"></i></span>
      <h3>${right.title}</h3><p>${right.text}</p>
    </article>`;
  createIcons({ icons });
}

document.querySelectorAll("[data-diagram]").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll("[data-diagram]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    await renderDiagram(button.dataset.diagram);
  });
});

document.querySelectorAll("[data-concept]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-concept]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    renderConcept(button.dataset.concept);
  });
});

renderConcept("frontstage");
renderDiagram("runtime");
