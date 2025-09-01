const form = document.getElementById("bioForm");
const bioOutput = document.getElementById("bioOutput");
const rerollBtn = document.getElementById("rerollBtn");
const shareBtn = document.getElementById("shareBtn");
const shareMenu = document.getElementById("shareMenu");
const copyBtn = document.getElementById("copyBtn");
const editBtn = document.getElementById("editBtn");
const saveEditBtn = document.getElementById("saveEditBtn");

let currentInputs = null;
let lastBio = "";

async function generateBioFromAPI(tone, length, keywords) {
  try {
    const response = await fetch("http://localhost:3000/generate-bio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tone, length, keywords }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.bio;
  } catch (error) {
    console.error("Error fetching bio:", error);
    return "Failed to generate bio. Please try again later.";
  }
}

function applyMode(bio, mode) {
  if (mode === "emoji") {
    return bio + " 😊✨👍";
  } else if (mode === "hashtag") {
    // Add simple hashtags (you can customize this)
    return bio + " #AI #BioGenie #Generated";
  } else if (mode === "bullet") {
    // Convert sentences to bullet points
    return bio
      .split(/\. |\n/)
      .filter(Boolean)
      .map((sentence) => "• " + sentence.trim())
      .join("\n");
  } else {
    return bio; // plain mode
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tone = form.tone.value;
  const length = form.length.value;
  const keywords = form.keywords.value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  // Read mode from 'formatting' select
  const mode = form.formatting ? form.formatting.value : "plain";

  bioOutput.textContent = "Generating bio...";
  bioOutput.setAttribute("contenteditable", "false");

  currentInputs = { tone, length, keywords, mode };
  const bio = await generateBioFromAPI(tone, length, keywords);

  lastBio = applyMode(bio, mode);
  bioOutput.textContent = lastBio;

  rerollBtn.disabled = false;
  shareBtn.disabled = false;
  copyBtn.disabled = false;
  editBtn.disabled = false;
  saveEditBtn.hidden = true;
});

rerollBtn.addEventListener("click", async () => {
  if (!currentInputs) return;

  bioOutput.textContent = "Regenerating bio...";
  bioOutput.setAttribute("contenteditable", "false");

  const { tone, length, keywords, mode } = currentInputs;
  const bio = await generateBioFromAPI(tone, length, keywords);

  lastBio = applyMode(bio, mode);
  bioOutput.textContent = lastBio;

  copyBtn.disabled = false;
  editBtn.disabled = false;
  saveEditBtn.hidden = true;
});

// COPY
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(bioOutput.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied! ✅";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1500);
  } catch (err) {
    console.error("Failed to copy:", err);
    copyBtn.textContent = "Failed to copy";
    setTimeout(() => {
      copyBtn.textContent = "Copy Bio";
    }, 1500);
  }
});

// EDIT BIO
editBtn.addEventListener("click", () => {
  bioOutput.setAttribute("contenteditable", "true");
  bioOutput.focus();
  editBtn.disabled = true;
  saveEditBtn.hidden = false;
});

// SAVE BIO
saveEditBtn.addEventListener("click", () => {
  bioOutput.setAttribute("contenteditable", "false");
  lastBio = bioOutput.textContent.trim();
  editBtn.disabled = false;
  saveEditBtn.hidden = true;
});

// Share dropdown toggle
shareBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = shareMenu.hasAttribute("hidden");
  if (isHidden) {
    shareMenu.removeAttribute("hidden");
    shareBtn.setAttribute("aria-expanded", "true");
  } else {
    shareMenu.setAttribute("hidden", "");
    shareBtn.setAttribute("aria-expanded", "false");
  }
});

// Close dropdown on outside click
document.addEventListener("click", () => {
  if (!shareMenu.hasAttribute("hidden")) {
    shareMenu.setAttribute("hidden", "");
    shareBtn.setAttribute("aria-expanded", "false");
  }
});

// Share option clicks
shareMenu.querySelectorAll(".share-option").forEach((button) => {
  button.addEventListener("click", () => {
    const platform = button.dataset.platform;
    const bioText = encodeURIComponent(bioOutput.textContent.trim());
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${bioText}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${bioText}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${bioText}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${bioText}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }

    shareMenu.setAttribute("hidden", "");
    shareBtn.setAttribute("aria-expanded", "false");
  });
});
