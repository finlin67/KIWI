const demoRows = [
  {
    fileId: "batch_003-001",
    filename: "invoice_reconciliation_notes.pdf",
    workspace: "Finance",
    route: "KEEP_HIGH_VALUE",
    status: "ready",
    score: 91,
    ai: false,
    review: false,
    matchedBy: "rules",
    updated: "2026-05-07 09:42"
  },
  {
    fileId: "batch_003-014",
    filename: "client_kickoff_duplicate.docx",
    workspace: "Client Ops",
    route: "KEEP_REVIEW",
    status: "review",
    score: 68,
    ai: true,
    review: true,
    matchedBy: "ollama",
    updated: "2026-05-07 09:45"
  },
  {
    fileId: "batch_003-029",
    filename: "migration_timeline_v2.md",
    workspace: "Delivery",
    route: "KEEP_HIGH_VALUE",
    status: "ready",
    score: 88,
    ai: false,
    review: false,
    matchedBy: "keyword",
    updated: "2026-05-07 09:47"
  },
  {
    fileId: "batch_003-044",
    filename: "old_export_copy.txt",
    workspace: "Archive",
    route: "ARCHIVE_DUPLICATE",
    status: "archive",
    score: 12,
    ai: false,
    review: false,
    matchedBy: "dedupe",
    updated: "2026-05-07 09:48"
  },
  {
    fileId: "batch_003-052",
    filename: "unclear_meeting_notes.pdf",
    workspace: "Unassigned",
    route: "KEEP_REVIEW",
    status: "review",
    score: 54,
    ai: true,
    review: true,
    matchedBy: "fallback",
    updated: "2026-05-07 09:50"
  },
  {
    fileId: "batch_003-078",
    filename: "support_contract_signed.pdf",
    workspace: "Client Ops",
    route: "KEEP_HIGH_VALUE",
    status: "complete",
    score: 94,
    ai: false,
    review: false,
    matchedBy: "company",
    updated: "2026-05-07 09:53"
  }
];

const triageRows = [
  { filename: "unclear_meeting_notes.pdf", current: "unassigned", assigned: false },
  { filename: "random_export_readme.txt", current: "unassigned", assigned: false },
  { filename: "client_statement_possible_duplicate.docx", current: "review", assigned: false },
  { filename: "scan_quality_low_confidence.pdf", current: "review", assigned: false },
  { filename: "contract_addendum_final.pdf", current: "Client Ops", assigned: true },
  { filename: "legacy_notes_no_keywords.md", current: "unassigned", assigned: false }
];

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page-link]");
const toast = document.getElementById("toast");
let homeFilter = "all";
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setPage(pageName) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === pageName);
  });
  if (window.location.hash !== `#${pageName}`) {
    history.replaceState(null, "", `#${pageName}`);
  }
}

function statusBadge(status) {
  return `<span class="status-badge status-${status}">${status}</span>`;
}

function renderHomeTable() {
  const body = document.getElementById("home-table");
  const rows = demoRows.filter((row) => {
    if (homeFilter === "ai") return row.ai;
    if (homeFilter === "review") return row.review;
    return true;
  });

  body.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.fileId}</td>
          <td>${row.filename}</td>
          <td>${row.workspace}</td>
          <td>${row.route}</td>
          <td>${statusBadge(row.status)}</td>
          <td>${row.score}</td>
        </tr>
      `
    )
    .join("");
}

function renderInventory() {
  const body = document.getElementById("inventory-table");
  const query = document.getElementById("inventory-search").value.trim().toLowerCase();
  const filter = document.getElementById("inventory-filter").value;

  const rows = demoRows.filter((row) => {
    if (query && !row.filename.toLowerCase().includes(query)) return false;
    if (filter === "ai" && !row.ai) return false;
    if (filter === "rules" && row.ai) return false;
    if (filter === "review" && !row.review) return false;
    return true;
  });

  body.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
          <tr>
            <td>${row.fileId}</td>
            <td>${row.filename}</td>
            <td>${row.workspace}</td>
            <td>${statusBadge(row.status)}</td>
            <td>${row.matchedBy}</td>
            <td>${row.updated}</td>
          </tr>
        `
        )
        .join("")
    : `<tr><td colspan="6">No files match this filter.</td></tr>`;
}

function renderTriage() {
  const body = document.getElementById("triage-table");
  const workspaceOptions = ["Finance", "Client Ops", "Delivery", "Archive", "Skip"];
  const openCount = triageRows.filter((row) => !row.assigned).length;
  const assignedCount = triageRows.filter((row) => row.assigned).length;

  document.getElementById("triage-open-count").textContent = openCount;
  document.getElementById("triage-assigned-count").textContent = assignedCount;

  body.innerHTML = triageRows
    .map(
      (row, index) => `
        <tr>
          <td>${row.filename}</td>
          <td>${row.current}</td>
          <td>
            <select data-triage-select="${index}" ${row.assigned ? "disabled" : ""}>
              ${workspaceOptions
                .map((option) => `<option ${option === row.current ? "selected" : ""}>${option}</option>`)
                .join("")}
            </select>
          </td>
          <td>
            ${
              row.assigned
                ? `<span class="pill success">Assigned</span>`
                : `<button class="button secondary" data-triage-assign="${index}">Assign</button>`
            }
          </td>
        </tr>
      `
    )
    .join("");
}

function simulateScan() {
  document.getElementById("run-state").textContent = "Scanned";
  document.getElementById("progress-bar").style.width = "72%";
  document.getElementById("metric-total").textContent = "225";
  document.getElementById("metric-classified").textContent = "184";
  document.getElementById("metric-review").textContent = "29";
  document.getElementById("metric-duplicates").textContent = "12";
  showToast("Demo scan complete: 225 files discovered");
}

function simulateRun() {
  const runState = document.getElementById("run-state");
  const progressBar = document.getElementById("progress-bar");
  runState.textContent = "Processing";
  progressBar.style.width = "45%";
  showToast("Running demo batch...");

  setTimeout(() => {
    runState.textContent = "Complete";
    progressBar.style.width = "100%";
    document.getElementById("metric-classified").textContent = "213";
    document.getElementById("metric-review").textContent = "12";
    showToast("Demo batch complete. Export files are ready.");
  }, 850);
}

function renderBatchResults(created = false) {
  const size = Number(document.getElementById("batch-size").value) || 300;
  const total = 1184;
  const usable = 1128;
  const estimated = Math.ceil(usable / size);
  const batchNames = Array.from({ length: estimated }, (_, i) => ({
    name: `batch_${String(i + 1).padStart(3, "0")}`,
    count: i === estimated - 1 ? usable - size * (estimated - 1) : size
  }));

  document.getElementById("batch-result-pill").textContent = created ? "Created" : "Preview";
  document.getElementById("batch-result-pill").className = `pill ${created ? "success" : "info"}`;
  document.getElementById("batch-results").innerHTML = `
    <div class="metric-grid compact">
      <div class="metric"><span>Total files</span><strong>${total}</strong></div>
      <div class="metric"><span>Usable files</span><strong>${usable}</strong></div>
      <div class="metric"><span>Empty files</span><strong>${total - usable}</strong></div>
      <div class="metric"><span>Batches</span><strong>${estimated}</strong></div>
    </div>
    <p>${created ? "Created" : "Previewed"} ${estimated} batches from ${usable} usable files.</p>
    <ul>
      ${batchNames.map((batch) => `<li><span>${batch.name}</span><strong>${batch.count} files</strong></li>`).join("")}
    </ul>
  `;
}

document.addEventListener("click", (event) => {
  const pageLink = event.target.closest("[data-page-link]");
  if (pageLink) {
    event.preventDefault();
    setPage(pageLink.dataset.pageLink);
    return;
  }

  const homeFilterButton = event.target.closest("[data-home-filter]");
  if (homeFilterButton) {
    homeFilter = homeFilterButton.dataset.homeFilter;
    document.querySelectorAll("[data-home-filter]").forEach((button) => {
      button.classList.toggle("active", button === homeFilterButton);
    });
    renderHomeTable();
    return;
  }

  const action = event.target.closest("[data-demo-action]");
  if (action) {
    if (action.dataset.demoAction === "scan") simulateScan();
    if (action.dataset.demoAction === "run") simulateRun();
    return;
  }

  const toastButton = event.target.closest("[data-toast]");
  if (toastButton) {
    showToast(toastButton.dataset.toast);
    return;
  }

  const triageAssign = event.target.closest("[data-triage-assign]");
  if (triageAssign) {
    const index = Number(triageAssign.dataset.triageAssign);
    const select = document.querySelector(`[data-triage-select="${index}"]`);
    triageRows[index].current = select.value;
    triageRows[index].assigned = true;
    renderTriage();
    showToast(`${triageRows[index].filename} assigned to ${select.value}`);
    return;
  }

  const triageBulk = event.target.closest("[data-triage-action='assign-all']");
  if (triageBulk) {
    const workspace = document.getElementById("bulk-workspace").value;
    triageRows.forEach((row) => {
      if (!row.assigned) {
        row.current = workspace;
        row.assigned = true;
      }
    });
    renderTriage();
    showToast(`All visible files assigned to ${workspace}`);
    return;
  }

  if (event.target.closest("[data-inventory-reset]")) {
    document.getElementById("inventory-search").value = "";
    document.getElementById("inventory-filter").value = "all";
    renderInventory();
    return;
  }

  if (event.target.closest("[data-batch-preview]")) {
    renderBatchResults(false);
    showToast("Batch preview generated");
    return;
  }

  if (event.target.closest("[data-batch-create]")) {
    renderBatchResults(true);
    showToast("Demo batches created");
  }
});

document.getElementById("inventory-search").addEventListener("input", renderInventory);
document.getElementById("inventory-filter").addEventListener("change", renderInventory);

renderHomeTable();
renderInventory();
renderTriage();
setPage((window.location.hash || "#home").replace("#", ""));
