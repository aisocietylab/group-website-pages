/* ==========================================================================
   jQuery plugin settings and other scripts
   ========================================================================== */

$(document).ready(function () {
  // FitVids init
  $("#main").fitVids();

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").toggleClass("is--visible");
    $(".author__urls-wrapper").find("button").toggleClass("open");
  });

  // Close search screen with Esc key
  $(document).keyup(function (e) {
    if (e.keyCode === 27) {
      if ($(".initial-content").hasClass("is--hidden")) {
        $(".search-content").toggleClass("is--visible");
        $(".initial-content").toggleClass("is--hidden");
      }
    }
  });

  // Search toggle
  $(".search__toggle").on("click", function () {
    $(".search-content").toggleClass("is--visible");
    $(".initial-content").toggleClass("is--hidden");
    // set focus on input
    setTimeout(function () {
      $(".search-content input").focus();
    }, 400);
  });

  // Smooth scrolling
  var scroll = new SmoothScroll('a[href*="#"]', {
    offset: 20,
    speed: 400,
    speedAsDuration: true,
    durationMax: 500,
  });

  // Gumshoe scroll spy init
  if ($("nav.toc").length > 0) {
    var spy = new Gumshoe("nav.toc a", {
      // Active classes
      navClass: "active", // applied to the nav list item
      contentClass: "active", // applied to the content

      // Nested navigation
      nested: false, // if true, add classes to parents of active link
      nestedClass: "active", // applied to the parent items

      // Offset & reflow
      offset: 20, // how far from the top of the page to activate a content area
      reflow: true, // if true, listen for reflows

      // Event support
      events: true, // if true, emit custom events
    });
  }

  // Auto scroll sticky ToC with content
  const scrollTocToContent = function (event) {
    var target = event.target;
    var scrollOptions = { behavior: "auto", block: "nearest", inline: "start" };

    var tocElement = document.querySelector("aside.sidebar__right.sticky");
    if (!tocElement) return;
    if (window.getComputedStyle(tocElement).position !== "sticky") return;

    if (target.parentElement.classList.contains("toc__menu") && target == target.parentElement.firstElementChild) {
      // Scroll to top instead
      document.querySelector("nav.toc header").scrollIntoView(scrollOptions);
    } else {
      target.scrollIntoView(scrollOptions);
    }
  };

  // Has issues on Firefox, whitelist Chrome for now
  if (!!window.chrome) {
    document.addEventListener("gumshoeActivate", scrollTocToContent);
  }

  // add lightbox class to all image links
  $(
    "a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif'],a[href$='.webp']"
  ).has("> img").addClass("image-popup");

  // Magnific-Popup options
  $(".image-popup").magnificPopup({
    // disableOn: function() {
    //   if( $(window).width() < 500 ) {
    //     return false;
    //   }
    //   return true;
    // },
    type: "image",
    tLoading: "Loading image #%curr%...",
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1], // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    },
    removalDelay: 500, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it unique to apply your CSS animations just to this exact popup
    mainClass: "mfp-zoom-in",
    callbacks: {
      beforeOpen: function () {
        // just a hack that adds mfp-anim class to markup
        this.st.image.markup = this.st.image.markup.replace(
          "mfp-figure",
          "mfp-figure mfp-with-anim"
        );
      },
    },
    closeOnContentClick: true,
    midClick: true, // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
  });

  // Add anchors for headings
  (function () {
    var pageContentElement = document.querySelector(".page__content");
    if (!pageContentElement) return;

    pageContentElement
      .querySelectorAll("h1, h2, h3, h4, h5, h6")
      .forEach(function (element) {
        var id = element.getAttribute("id");
        if (id) {
          var anchor = document.createElement("a");
          anchor.className = "header-link";
          anchor.href = "#" + id;
          anchor.innerHTML =
            '<i class="fas fa-link"></i>';
          anchor.title = "Permalink";
          element.appendChild(anchor);
        }
      });
  })();

  // Add copy button for <pre> blocks
  var copyText = function (text) {
    if (document.queryCommandEnabled("copy") && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => true,
        () => console.error("Failed to copy text to clipboard: " + text)
      );
      return true;
    } else {
      var isRTL = document.documentElement.getAttribute("dir") === "rtl";

      var textarea = document.createElement("textarea");
      textarea.className = "clipboard-helper";
      textarea.style[isRTL ? "right" : "left"] = "-9999px";
      // Move element to the same position vertically
      var yPosition = window.pageYOffset || document.documentElement.scrollTop;
      textarea.style.top = yPosition + "px";

      textarea.setAttribute("readonly", "");
      textarea.value = text;
      document.body.appendChild(textarea);

      var success = true;
      try {
        textarea.select();
        success = document.execCommand("copy");
      } catch (e) {
        success = false;
      }
      textarea.parentNode.removeChild(textarea);
      return success;
    }
  };

  var copyButtonEventListener = function (event) {
    var thisButton = event.target;

    // Locate the <code> element
    var codeBlock = thisButton.nextElementSibling;
    while (codeBlock && codeBlock.tagName.toLowerCase() !== "code") {
      codeBlock = codeBlock.nextElementSibling;
    }
    if (!codeBlock) {
      // No <code> found - wtf?
      console.warn(thisButton);
      throw new Error("No code block found for this button.");
    }

    // Skip line numbers if present (i.e. {% highlight lineno %})
    var realCodeBlock = codeBlock.querySelector("td.code, td.rouge-code");
    if (realCodeBlock) {
      codeBlock = realCodeBlock;
    }
    var result = copyText(codeBlock.innerText);
    // Restore the focus to the button
    thisButton.focus();
    if (result) {
      if (thisButton.interval !== null) {
        clearInterval(thisButton.interval);
      }
      thisButton.classList.add('copied');
      thisButton.interval = setTimeout(function () {
        thisButton.classList.remove('copied');
        clearInterval(thisButton.interval);
        thisButton.interval = null;
      }, 1500);
    }
    return result;
  };

  if (window.enable_copy_code_button) {
    document
      .querySelectorAll(".page__content pre.highlight > code")
      .forEach(function (element, index, parentList) {
        // Locate the <pre> element
        var container = element.parentElement;
        // Sanity check - don't add an extra button if there's already one
        if (container.firstElementChild.tagName.toLowerCase() !== "code") {
          return;
        }
        var copyButton = document.createElement("button");
        copyButton.title = "Copy to clipboard";
        copyButton.className = "clipboard-copy-button";
        copyButton.innerHTML = '<span class="sr-only">Copy code</span><i class="far fa-fw fa-copy"></i><i class="fas fa-fw fa-check copied"></i>';
        copyButton.addEventListener("click", copyButtonEventListener);
        container.prepend(copyButton);
      });
  }
  // `Project` layout specific functions
  window.HELP_IMPROVE_VIDEOJS = false;

  window.addEventListener('scroll', function () {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
      scrollButton.classList.add('visible');
    } else {
      scrollButton.classList.remove('visible');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');

    if (container && !container.contains(event.target)) {
      dropdown.classList.remove('show');
      button.classList.remove('active');
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      const dropdown = document.getElementById('moreWorksDropdown');
      const button = document.querySelector('.more-works-btn');
      dropdown.classList.remove('show');
      button.classList.remove('active');
    }
  });
});


// More Works Dropdown Functionality
function toggleMoreWorks() {
  const dropdown = document.getElementById('moreWorksDropdown');
  const button = document.querySelector('.more-works-btn');

  if (dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  } else {
    dropdown.classList.add('show');
    button.classList.add('active');
  }
}

// Copy BibTeX to clipboard
function copyBibTeX() {
  const bibtexElement = document.getElementById('bibtex-code');
  const button = document.querySelector('#copy-bibtex-btn');
  const copyText = button.querySelector('#copy-text');

  if (bibtexElement) {
    navigator.clipboard.writeText(bibtexElement.textContent).then(function () {
      // Success feedback
      button.classList.add('btn--success');
      copyText.textContent = 'Copied';

      setTimeout(function () {
        button.classList.remove('btn--success');
        copyText.textContent = 'Copy';
      }, 2000);
    }).catch(function (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bibtexElement.textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      button.classList.add('copied');
      copyText.textContent = 'Copied';
      setTimeout(function () {
        button.classList.remove('copied');
        copyText.textContent = 'Copy';
      }, 2000);
    });
  }
}

// Scroll to top functionality
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}