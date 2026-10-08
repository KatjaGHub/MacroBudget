// MacroBudget shopping list widget for the Scriptable app (iPhone home and lock screen).
//
// Setup:
// 1. Install "Scriptable" from the App Store.
// 2. Create a new script, paste this file in and name it "Shopping list".
// 3. Long-press the home screen → + → Scriptable → pick a size → Add Widget.
// 4. Long-press the widget → Edit Widget:
//      Script:    Shopping list
//      Parameter: your link from MacroBudget → Settings → Shopping list link
//                 (the HabitQuest one, without ?format=text)

const PINK = new Color("#ec4899");
const ROSE = new Color("#881337");
const ROSE_DARK = new Color("#fce7f3");
const BG = Color.dynamic(new Color("#fff7fb"), new Color("#160b14"));
const TEXT = Color.dynamic(ROSE, ROSE_DARK);

const url = (args.widgetParameter || "").trim();
const family = config.widgetFamily || "large";
const maxItems = { small: 5, medium: 5, large: 13, extraLarge: 13 }[family] ?? 3;

async function loadItems() {
  if (!url) return { error: "Add your MacroBudget link as the widget parameter." };

  try {
    const request = new Request(url);
    request.timeoutInterval = 10;
    const items = await request.loadJSON();
    if (!Array.isArray(items)) return { error: "Link not valid." };
    return { items };
  } catch {
    return { error: "Could not load the list." };
  }
}

function label(item) {
  return item.quantity ? `${item.name} (${item.quantity})` : item.name;
}

function buildHomeWidget({ items, error }) {
  const widget = new ListWidget();
  widget.backgroundColor = BG;
  widget.setPadding(14, 14, 14, 14);

  const header = widget.addStack();
  const title = header.addText("🛒 Shopping");
  title.font = Font.heavySystemFont(family === "small" ? 14 : 16);
  title.textColor = PINK;
  header.addSpacer();

  if (items) {
    const count = header.addText(String(items.length));
    count.font = Font.heavySystemFont(14);
    count.textColor = PINK;
  }

  widget.addSpacer(8);

  if (error) {
    const text = widget.addText(error);
    text.font = Font.mediumSystemFont(12);
    text.textColor = TEXT;
  } else if (items.length === 0) {
    const text = widget.addText("All done ♡");
    text.font = Font.semiboldSystemFont(14);
    text.textColor = TEXT;
  } else {
    for (const item of items.slice(0, maxItems)) {
      const line = widget.addText(`• ${label(item)}`);
      line.font = Font.semiboldSystemFont(family === "small" ? 12 : 14);
      line.textColor = TEXT;
      line.lineLimit = 1;
    }

    if (items.length > maxItems) {
      const more = widget.addText(`+${items.length - maxItems} more`);
      more.font = Font.mediumSystemFont(11);
      more.textColor = PINK;
    }
  }

  widget.addSpacer();
  return widget;
}

function buildLockScreenWidget({ items, error }) {
  const widget = new ListWidget();

  if (family === "accessoryInline") {
    widget.addText(error ? "🛒 –" : `🛒 ${items.length} to buy`);
    return widget;
  }

  if (family === "accessoryCircular") {
    widget.addSpacer();
    const icon = widget.addText("🛒");
    icon.centerAlignText();
    const count = widget.addText(error ? "–" : String(items.length));
    count.font = Font.heavySystemFont(16);
    count.centerAlignText();
    widget.addSpacer();
    return widget;
  }

  // accessoryRectangular
  if (error) {
    widget.addText("🛒 –");
    return widget;
  }

  const shown = items.slice(0, 3);
  if (shown.length === 0) widget.addText("🛒 All done ♡");
  for (const item of shown) {
    const line = widget.addText(label(item));
    line.font = Font.semiboldSystemFont(12);
    line.lineLimit = 1;
  }
  return widget;
}

const result = await loadItems();
const widget = family.startsWith("accessory")
  ? buildLockScreenWidget(result)
  : buildHomeWidget(result);

// Tapping the widget opens the shopping list in MacroBudget.
if (url.includes("/api/shopping/")) {
  widget.url = url.split("/api/shopping/")[0] + "/shopping-list";
}
widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentLarge();
}
Script.complete();
