const jobList = document.querySelector(".joblist");
const filterHead = document.querySelector(".header__filter");
const filters = document.querySelector(".filters");
const clearBtn = document.querySelector(".clear");
let filterInfo;

restoreLocalStorage();

checkVisibility();

async function getData() {
    const data = await fetch(`./data.json`);
    const result = await data.json();

    return result;
}

async function renderJobs(data) {
    const jobData = await data;
    jobData.forEach((job) => {
        const markup = `
        <li class="jobpost ${job.new && job.featured ? "specialBorder" : ""}">
        <img src="${job.logo}" alt="job photo" class="jobpost__img">
        <div class="jobpost__details">
          <div class="jobpost__status">
            <h3 class="jobpost__company">${job.company}</h3>
            ${addCapsules(job.new, job.featured)}
          </div>
          <h2 class="jobpost__role">${job.position}</h2>
          <div class="jobpost__date">
            <span class="jobpost__time">${job.postedAt}</span>
            <div class="dot"></div>
            <span class="jobpost__time">${job.contract}</span>
            <div class="dot"></div>
            <span class="jobpost__time">${job.location}</span>
          </div>
        </div>

        <div class="jobpost__categories">
          ${renderTags(job)}
        </div>
      </li>
        `;

        jobList.insertAdjacentHTML("beforeend", markup);
    });
}

function addCapsules(newTab, featuredTab) {
    let markup;

    if (newTab && featuredTab) {
        markup = `<span class="new">NEW</span>
        <span class="featured">FEATURED</span>`;
    } else if (newTab) {
        markup = `   <span class="new">NEW</span>`;
    } else if (featuredTab) {
        markup = `<span class="featured">FEATURED</>`;
    } else {
        markup = "";
    }

    return markup;
}

function renderTags(job) {
    let tags = getTags(job);
    let markup = "";

    if ("tools" in job && "languages" in job) {
        tags = [...job.tools, ...job.languages, job.level, job.role];
    } else if ("tools" in job) {
        tags = [...job.tools, job.level, job.role];
    } else if ("languages" in job) {
        tags = [...job.languages, job.level, job.role];
    }

    tags.forEach((tag) => {
        markup += `<button class="category-btn">${tag}</button>`;
    });

    return markup;
}

function checkVisibility() {
    if (filterInfo.length > 0) {
        filterHead.style.visibility = "visible";
    } else {
        filterHead.style.visibility = "hidden";
    }
}

function AddTags(e) {
    if (e.target.matches(".category-btn")) {
        const tag = e.target.textContent;
        if (!filterInfo.includes(tag)) filterInfo.push(tag);
        updateLocalStorage();
        // console.log(filterInfo);
        renderFilterTags();
        filterJobs();
    }
    checkVisibility();
}

function renderFilterTags() {
    filters.innerHTML = "";
    filterInfo.forEach((tag) => {
        const markup = `
        <p class="filter-category">
            <span>${tag}</span>
            <button class="delete-category">
              <span>&times;</span>
            </button>
        </p>
        `;

        filters.insertAdjacentHTML("beforeend", markup);
    });
}

function restoreLocalStorage() {
    if (localStorage.length > 0) {
        filterInfo = JSON.parse(localStorage.getItem("data"));
    } else {
        filterInfo = [];
    }

    renderFilterTags();
    filterJobs();
}

function clearFilters() {
    filterInfo.length = 0;
    updateLocalStorage();
    checkVisibility();
    renderFilterTags();
    clearJobList();
    renderJobs(getData());
}

function updateLocalStorage() {
    localStorage.setItem("data", JSON.stringify(filterInfo));
}

function removeTags(e) {
    if (e.target.matches(".delete-category")) {
        const tagName = e.target.parentElement.firstElementChild.textContent;
        console.log(tagName);
        const index = filterInfo.findIndex((cur) => cur === tagName);
        filterInfo.splice(index, 1);
        checkVisibility();
        updateLocalStorage();
        filterJobs();
        renderFilterTags();
    }
}

async function filterJobs() {
    const jobData = await getData();
    const filteredJobs = [];
    jobData.forEach((job) => {
        let jobTags = getTags(job);

        const present = filterInfo.every((tag) => jobTags.includes(tag));

        if(present) filteredJobs.push(job);
    });

    clearJobList();
    renderJobs(filteredJobs);
}

function clearJobList() {
    jobList.innerHTML = "";
}

function getTags(job){
    let jobTags;
    if ("tools" in job && "languages" in job) {
        jobTags = [...job.tools, ...job.languages, job.level, job.role];
    } else if ("tools" in job) {
        jobTags = [...job.tools, job.level, job.role];
    } else if ("languages" in job) {
        jobTags = [...job.languages, job.level, job.role];
    }
    return jobTags;
}
//Initial Render
renderJobs(getData());

// Event Listeners
jobList.addEventListener("click", AddTags);
clearBtn.addEventListener("click", clearFilters);
filters.addEventListener("click", removeTags);
