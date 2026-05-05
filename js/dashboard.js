// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});

// Trulytics Dashboard JavaScript
// Uses real follower/following/post JSON data + real manually collected interaction data

async function loadJSON(filePath) {
    const response = await fetch(filePath);
    return await response.json();
}

function getMonth(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function countByMonth(items, timestampGetter) {
    const monthCounts = {};

    items.forEach(item => {
        const timestamp = timestampGetter(item);
        if (!timestamp) return;

        const month = getMonth(timestamp);
        monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    return monthCounts;
}

function makeCumulativeData(monthCounts) {
    const months = Object.keys(monthCounts).reverse();
    let total = 0;

    const cumulative = months.map(month => {
        total += monthCounts[month];
        return total;
    });

    return {
        labels: months,
        data: cumulative
    };
}

function createLineChart(canvasId, label, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                tension: 0.3
            }]
        },
        options: {
            responsive: true
        }
    });
}

function createBarChart(canvasId, label, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data
            }]
        },
        options: {
            responsive: true
        }
    });
}

function createPieChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        },
        options: {
            responsive: true
        }
    });
}

function updateText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

async function buildDashboard() {
    const followersFile = await loadJSON("data/followers_1.json");
    const followingFile = await loadJSON("data/following.json");
    const postsFile = await loadJSON("data/posts_1.json");

    const followers = followersFile;
    const following = followingFile.relationships_following;
    const posts = postsFile;

    const followerCount = followers.length;
    const followingCount = following.length;
    const postCount = posts.length;
    const ratio = (followerCount / followingCount).toFixed(2);

    const engagementLabels = [
        "Most Recent", "2", "3", "4", "5",
        "6", "7", "8", "9", "10"
    ];

    const engagementData = [
        222, 300, 148, 148, 220,
        159, 161, 153, 154, 95
    ];

    const averageInteractions = Math.round(
        engagementData.reduce((sum, value) => sum + value, 0) / engagementData.length
    );

    updateText("followers", followerCount);
    updateText("following", followingCount);
    updateText("posts", postCount);
    updateText("ratio", ratio);
    updateText("engagement", averageInteractions);

    const followerMonths = countByMonth(followers, item => item.string_list_data?.[0]?.timestamp);
    const followingMonths = countByMonth(following, item => item.string_list_data?.[0]?.timestamp);
    const postMonths = countByMonth(posts, item => item.creation_timestamp);

    const followerGrowth = makeCumulativeData(followerMonths);
    const followingGrowth = makeCumulativeData(followingMonths);

    const postLabels = Object.keys(postMonths).reverse();
    const postData = postLabels.map(month => postMonths[month]);

    createLineChart("followerGrowthChart", "Follower Growth", followerGrowth.labels, followerGrowth.data);
    createLineChart("followingGrowthChart", "Following Growth", followingGrowth.labels, followingGrowth.data);
    createBarChart("postChart", "Posts Per Month", postLabels, postData);

    createLineChart(
        "engagementChart",
        "Post Engagement (Interactions)",
        engagementLabels,
        engagementData
    );

    createPieChart(
        "contentChart",
        ["Carousel", "Single Image", "Video"],
        [12, 8, 5]
    );

    updateText("growthInsight", "Your follower growth shows how audience size changes over time.");
    updateText("audienceInsight", "Your follower/following ratio helps summarize your account relationship pattern.");
    updateText("engagementInsight", "Post engagement is based on manually collected Instagram interactions, including likes, comments, and sends.");
}

buildDashboard();