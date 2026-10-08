"use client";

import { useEffect } from "react";

const LILAI_ASSESSMENT_URL = "/free-departure-assessment";
const LILAI_SCHOOL_SIGNUP_URL = "/language-school-signup";
const LILAI_STORY_URL = "/alex-arsha";
const LILAI_COMMUNITY_URL = "/community";
const LILAI_GOOGLE_REVIEW_URL = "https://g.page/r/CWJ8OfbyjJMKEBE/review";

const ctaLinks: Record<string, string> = {
  assessment: LILAI_ASSESSMENT_URL,
  schoolSignup: LILAI_SCHOOL_SIGNUP_URL,
  story: LILAI_STORY_URL,
  community: LILAI_COMMUNITY_URL,
  googleReview: LILAI_GOOGLE_REVIEW_URL
};

const levelContent = [
  {
    title: "01 探索方向｜我到底適不適合去愛爾蘭？",
    copy: "不確定自己在哪一關？先做免費出發評估，讓學長姐陪你找到下一步。",
    cta: "免費出發評估",
    href: LILAI_ASSESSMENT_URL
  },
  {
    title: "02 規劃預算｜我要準備多少錢才安心？",
    copy: "把學費、住宿、生活費、落地緩衝與打工前的空窗期拆開看，先抓出你真的需要準備的出發範圍。",
    cta: "估算出發預算",
    href: LILAI_ASSESSMENT_URL
  },
  {
    title: "03 申請與準備｜文件和時間線怎麼排？",
    copy: "整理語校申請、保險、簽證文件、付款節點與出發前時間表，讓每一步都有明確順序。",
    cta: "我要報名語校",
    href: LILAI_SCHOOL_SIGNUP_URL
  },
  {
    title: "04 出發與落地｜第一個月怎麼穩住？",
    copy: "把住宿、交通、門號、銀行、找工作節奏與剛抵達的生活安排先排好，減少落地後的慌亂感。",
    cta: "看落地生活指南",
    href: "#life"
  },
  {
    title: "05 生活與成長｜抵達後怎麼建立生活圈？",
    copy: "從英文進步、打工節奏、朋友社群到城市生活，讓愛爾蘭不只是目的地，而是能慢慢長出來的生活。",
    cta: "看看哩來生活圈",
    href: LILAI_COMMUNITY_URL
  }
];

const schoolDetails: Record<string, string> = {
  "NED College": "適合想先把總預算壓穩、保留住宿與落地緩衝的人，可以作為小資出發的比較選項。",
  "ISI Dublin": "適合想要課程、活動與城市生活一起建立節奏的人。",
  "Atlas Language School": "適合重視學習環境、課程設計與英文進步感的人。",
  "ELI Schools": "適合想邊讀邊適應生活，也希望保留社交與活動彈性的人。",
  "Babel Academy of English": "適合想要更聚焦英文進步、希望課堂互動感明確的人。",
  "Centre of English Studies": "適合重視教材、師資與穩定學習架構的人。",
  "Emerald Cultural Institute": "適合預算較充足、希望整體體驗與學校質感更完整的人。",
  "Cork English College": "適合想避開 Dublin 高租金與高競爭，改用 Cork 節奏生活的人。",
  "Bridge Mills Galway": "適合想在 Galway 建立生活節奏、喜歡城市步調比較鬆的人。",
  "Limerick Language Centre": "適合想探索非 Dublin 城市、把生活成本和城市節奏一起考量的人。",
  "Liffey College": "適合已在愛爾蘭、正在比較續簽和預算轉場選項的人。"
};

const schoolLogos: Record<string, string> = {
  "NED College": "/assets/logo-ned-college.png",
  "ISI Dublin": "/assets/logo-isi-learning.png",
  "Atlas Language School": "/assets/logo-atlas-language-school.png",
  "ELI Schools": "/assets/logo-eli-schools.png",
  "Babel Academy of English": "/assets/logo-babel-academy.png",
  "Centre of English Studies": "/assets/logo-centre-of-english-studies.png",
  "Emerald Cultural Institute": "/assets/logo-emerald-cultural-institute.png",
  "Cork English College": "/assets/logo-cork-english-college.png",
  "Bridge Mills Galway": "/assets/logo-bridge-mills-galway.png",
  "Limerick Language Centre": "/assets/logo-limerick-language-centre.png",
  "Liffey College": "/assets/logo-liffey-college.png"
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function removeRevealState(node: Element) {
  node.removeAttribute("data-reveal");
  node.classList.add("is-visible");
  node.querySelectorAll("[data-reveal]").forEach(child => {
    child.removeAttribute("data-reveal");
    child.classList.add("is-visible");
  });
}

export function HomeInteractions() {
  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>("[data-cta-link]").forEach(link => {
      const key = link.dataset.ctaLink;
      if (key && ctaLinks[key]) link.href = ctaLinks[key];
    });

    const revealItems = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealItems.forEach(item => revealObserver.observe(item));
    } else {
      revealItems.forEach(item => item.classList.add("is-visible"));
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animationFrames = new Set<number>();

    document.querySelectorAll<HTMLElement>("[data-auto-scroll]").forEach(row => {
      if (row.dataset.autoScrollReady === "true") return;
      row.dataset.autoScrollReady = "true";

      const originalItems = Array.from(row.children);
      if (prefersReducedMotion || originalItems.length < 2) return;

      originalItems.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]").forEach(focusable => {
          focusable.setAttribute("tabindex", "-1");
        });
        removeRevealState(clone);
        row.appendChild(clone);
      });

      let isPaused = false;
      let lastFrame = performance.now();
      const speed = row.classList.contains("review-grid") ? 0.06 : 0.045;

      const pause = () => {
        isPaused = true;
      };
      const resume = () => {
        isPaused = false;
        lastFrame = performance.now();
      };
      const tick = (now: number) => {
        const delta = Math.min(now - lastFrame, 64);
        lastFrame = now;

        if (!isPaused) {
          row.scrollLeft += delta * speed;
          const resetPoint = row.scrollWidth / 2;
          if (resetPoint > 0 && row.scrollLeft >= resetPoint) row.scrollLeft -= resetPoint;
        }

        animationFrames.add(requestAnimationFrame(tick));
      };

      row.addEventListener("mouseenter", pause);
      row.addEventListener("mouseleave", resume);
      row.addEventListener("focusin", pause);
      row.addEventListener("focusout", resume);
      row.addEventListener("touchstart", pause, { passive: true });
      row.addEventListener("touchend", () => window.setTimeout(resume, 1200), { passive: true });
      animationFrames.add(requestAnimationFrame(tick));
    });

    if ("IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const node = entry.target as HTMLElement;
            const target = Number(node.dataset.count);
            const decimals = Number(node.dataset.decimal || 0);
            const duration = 1300;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              node.textContent = (target * eased).toLocaleString("en-US", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
              });
              if (progress < 1) animationFrames.add(requestAnimationFrame(tick));
            };

            animationFrames.add(requestAnimationFrame(tick));
            countObserver.unobserve(node);
          });
        },
        { threshold: 0.35 }
      );

      document.querySelectorAll("[data-count]").forEach(item => countObserver.observe(item));
    }

    document.querySelectorAll<HTMLElement>("[data-route-visual]").forEach(visual => {
      if (visual.dataset.routeReady === "true") return;
      visual.dataset.routeReady = "true";

      const questions = Array.from(visual.querySelectorAll<HTMLElement>(".question"));
      const routePath = visual.querySelector<SVGPathElement>(".flight-route");
      const routeTrack = visual.querySelector<SVGPathElement>(".flight-track");
      const plane = visual.querySelector<HTMLElement>(".plane");
      const routePathD = "M94.2 50.4 C67 43 36.5 35.6 3.9 32.2";

      routePath?.setAttribute("d", routePathD);
      routeTrack?.setAttribute("d", routePathD);

      if (prefersReducedMotion) {
        questions.forEach(question => question.classList.add("is-active"));
        if (plane) {
          plane.style.left = "94.2%";
          plane.style.top = "50.4%";
          plane.style.opacity = "0.78";
          plane.style.transform = "translate(-50%, -50%) rotate(-18deg) scale(0.82)";
        }
        return;
      }

      const cycleDuration = 9000;
      const planeStart = 750;
      const planeEnd = 8667;
      const firstReveal = planeStart;
      const revealSpan = planeEnd - planeStart - 1167;
      const resetAt = planeEnd;
      const start = performance.now();
      const routeLength = routePath?.getTotalLength() || 0;
      const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

      const tick = (now: number) => {
        const elapsed = (now - start) % cycleDuration;

        if (plane && routePath && routeLength > 0) {
          const rawProgress = clamp((elapsed - planeStart) / (planeEnd - planeStart), 0, 1);
          const point = routePath.getPointAtLength(routeLength * rawProgress);
          const fadeIn = clamp((elapsed - planeStart) / 520, 0, 1);
          const fadeOut = clamp((planeEnd + 520 - elapsed) / 520, 0, 1);
          const opacity = Math.min(fadeIn, fadeOut) * 0.78;
          const rotation = -18 + rawProgress * 16;

          plane.style.left = `${point.x}%`;
          plane.style.top = `${point.y}%`;
          plane.style.opacity = String(opacity);
          plane.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0.86)`;
        }

        questions.forEach((question, index) => {
          const revealAt = firstReveal + index * (revealSpan / Math.max(questions.length - 1, 1));
          question.classList.toggle("is-active", elapsed >= revealAt && elapsed < resetAt);
        });

        animationFrames.add(requestAnimationFrame(tick));
      };

      animationFrames.add(requestAnimationFrame(tick));
    });

    const levelCards = document.querySelectorAll<HTMLElement>("[data-level]");
    const levelTitle = document.querySelector<HTMLElement>("[data-level-title]");
    const levelCopy = document.querySelector<HTMLElement>("[data-level-copy]");
    const levelCta = document.querySelector<HTMLAnchorElement>("[data-level-cta]");

    const setActiveLevel = (index: number) => {
      const content = levelContent[index];
      if (!content || !levelTitle || !levelCopy || !levelCta) return;

      levelCards.forEach(card => {
        const isActive = Number(card.dataset.level) === index;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-pressed", String(isActive));
      });

      levelTitle.textContent = content.title;
      levelCopy.textContent = content.copy;
      levelCta.textContent = content.cta;
      levelCta.href = content.href;
    };

    levelCards.forEach(card => {
      if (card.dataset.levelReady === "true") return;
      card.dataset.levelReady = "true";
      card.setAttribute("aria-pressed", String(card.classList.contains("is-active")));
      card.addEventListener("click", () => setActiveLevel(Number(card.dataset.level)));
      card.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        setActiveLevel(Number(card.dataset.level));
      });
    });

    document.querySelectorAll<HTMLElement>(".btn-magnet").forEach(button => {
      if (button.dataset.magnetReady === "true") return;
      button.dataset.magnetReady = "true";
      button.addEventListener("mousemove", event => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / 8;
        const y = (event.clientY - rect.top - rect.height / 2) / 8;
        button.style.transform = `translate3d(${x}px, ${y - 2}px, 0)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });

    const setActiveSchoolCard = (stack: HTMLElement, activeIndex: number) => {
      const cards = Array.from(stack.querySelectorAll<HTMLElement>(".mini-school-card"));
      const popover = stack.closest(".school-popover");
      const detail = popover?.querySelector(".school-detail");
      const detailTitle = detail?.querySelector("strong");
      const detailCopy = detail?.querySelector("p");
      const featureLink = detail?.querySelector<HTMLAnchorElement>("[data-school-feature]");
      const signupLink = detail?.querySelector<HTMLAnchorElement>("[data-school-signup]");

      cards.forEach((card, index) => {
        const relativePosition = (index - activeIndex + cards.length) % cards.length;
        card.classList.toggle("is-front", relativePosition === 0);
        card.classList.toggle("is-middle", relativePosition === 1);
        card.classList.toggle("is-back", relativePosition === 2);
        card.classList.toggle("is-selected", index === activeIndex);
        card.setAttribute("aria-pressed", String(index === activeIndex));
      });

      const schoolName = cards[activeIndex]?.textContent?.trim();
      if (!schoolName || !detailTitle || !detailCopy || !featureLink || !signupLink) return;

      detailTitle.textContent = schoolName;
      detailCopy.textContent = schoolDetails[schoolName] || "特色整理準備中，可以先把這間加入比較清單。";
      featureLink.textContent = "查看學校特色";
      featureLink.href = LILAI_SCHOOL_SIGNUP_URL;
      signupLink.textContent = "我要報名語校";
      signupLink.href = LILAI_SCHOOL_SIGNUP_URL;
    };

    document.querySelectorAll<HTMLElement>(".school-stack").forEach(stack => {
      if (stack.dataset.schoolReady === "true") return;
      stack.dataset.schoolReady = "true";

      const cards = Array.from(stack.querySelectorAll<HTMLElement>(".mini-school-card"));
      const detail = document.createElement("div");
      detail.className = "school-detail";
      detail.innerHTML = `
        <strong></strong>
        <p></p>
        <div class="school-detail-actions">
          <a href="${LILAI_SCHOOL_SIGNUP_URL}" data-school-feature></a>
          <a href="${LILAI_SCHOOL_SIGNUP_URL}" data-school-signup></a>
        </div>
      `;
      stack.insertAdjacentElement("afterend", detail);

      cards.forEach((card, index) => {
        const schoolName = card.textContent?.trim() || "";
        const logoSrc = schoolLogos[schoolName];
        card.textContent = "";
        card.dataset.logo = initials(schoolName);

        if (logoSrc) {
          card.classList.add("has-logo");
          const logo = document.createElement("img");
          logo.className = "school-logo";
          logo.src = logoSrc;
          logo.alt = `${schoolName} logo`;
          card.appendChild(logo);
        }

        const label = document.createElement("span");
        label.className = "school-name";
        label.textContent = schoolName;
        card.appendChild(label);
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-pressed", "false");

        card.addEventListener("click", event => {
          event.preventDefault();
          setActiveSchoolCard(stack, index);
        });

        let hoverTimer: ReturnType<typeof setTimeout>;
        card.addEventListener("mouseenter", () => {
          if (window.matchMedia("(pointer: coarse)").matches) return;
          hoverTimer = setTimeout(() => setActiveSchoolCard(stack, index), 280);
        });
        card.addEventListener("mouseleave", () => clearTimeout(hoverTimer));
        card.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setActiveSchoolCard(stack, index);
        });
      });

      setActiveSchoolCard(stack, 0);
    });

    const schoolCards = document.querySelectorAll<HTMLElement>(".school-card");
    schoolCards.forEach(card => {
      const trigger = card.querySelector(".pill-trigger");
      if (!trigger || (trigger as HTMLElement).dataset.mobileReady === "true") return;
      (trigger as HTMLElement).dataset.mobileReady = "true";
      trigger.addEventListener("click", event => {
        if (!window.matchMedia("(max-width: 720px)").matches) return;
        event.preventDefault();
        const wasOpen = card.classList.contains("is-open");
        schoolCards.forEach(item => item.classList.remove("is-open"));
        card.classList.toggle("is-open", !wasOpen);
      });
    });

    return () => {
      animationFrames.forEach(frame => cancelAnimationFrame(frame));
    };
  }, []);

  return null;
}
