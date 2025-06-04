// Global variables
let currentUser = null;
let stories = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  loadStories();
  setupEventListeners();
});

// Authentication handling
function handleAuthentication() {
  // This function is called when user successfully authenticates
  fetch('/user-info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(userData => {
    currentUser = userData;
    updateUIForLoggedInUser();
  })
  .catch(error => {
    console.error('Error getting user info:', error);
    // Fallback - simulate user data for demo
    currentUser = {
      id: 'demo_' + Date.now(),
      name: 'Anonymous User',
      username: 'user_' + Math.floor(Math.random() * 1000)
    };
    updateUIForLoggedInUser();
  });
}

function updateUIForLoggedInUser() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('user-section').style.display = 'block';
  document.getElementById('user-name').textContent = `Hello, ${currentUser.username}`;
  document.getElementById('post-btn').style.display = 'block';
}

function logout() {
  currentUser = null;
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('user-section').style.display = 'none';
  document.getElementById('post-btn').style.display = 'none';
  showHome();
}

// Navigation functions
function showHome() {
  hideAllSections();
  document.getElementById('home-section').style.display = 'block';
}

function showStories() {
  hideAllSections();
  document.getElementById('stories-section').style.display = 'block';
  displayAllStories();
}

function showPostForm() {
  if (!currentUser) {
    alert('Please log in to share your story.');
    return;
  }
  hideAllSections();
  document.getElementById('post-section').style.display = 'block';
}

function hideAllSections() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.style.display = 'none');
  document.getElementById('search-results').style.display = 'none';
}

// Story management
function setupEventListeners() {
  // Custom sign-up form submission
  const signupForm = document.getElementById('custom-signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleCustomSignup();
    });
  }

  // Story form submission
  const storyForm = document.getElementById('story-form');
  if (storyForm) {
    storyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitStory();
    });
  }

  // Search functionality
  const searchInput = document.getElementById('heart-search');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchStories();
      }
    });
  }
}

function handleCustomSignup() {
  const pseudonym = document.getElementById('pseudonym').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!pseudonym) {
    alert('Please enter a pseudonym to continue.');
    return;
  }

  // Simulate user creation with custom signup
  currentUser = {
    id: 'custom_' + Date.now(),
    name: pseudonym,
    username: pseudonym,
    email: email || null,
    signupMethod: 'custom'
  };

  updateUIForLoggedInUser();
  
  // Hide the signup section after successful signup
  document.querySelector('.signup-section').style.display = 'none';
  
  alert(`Welcome to Talk It Out, ${pseudonym}! You can now share your story and connect with others.`);
}

function submitStory() {
  const title = document.getElementById('story-title').value.trim();
  const content = document.getElementById('story-content').value.trim();
  const tags = document.getElementById('story-tags').value.trim();

  if (!title || !content) {
    alert('Please fill in both title and content.');
    return;
  }

  const story = {
    id: 'story_' + Date.now(),
    title: title,
    content: content,
    tags: tags.split(',').map(tag => tag.trim().toLowerCase()),
    author: currentUser.username,
    authorId: currentUser.id,
    timestamp: new Date().toISOString(),
    reactions: {
      '❤️': 0,
      '🤗': 0,
      '💪': 0,
      '🌟': 0,
      '🙏': 0
    },
    userReactions: {}
  };

  stories.unshift(story);
  saveStories();
  
  // Clear form
  document.getElementById('story-form').reset();
  
  alert('Your story has been shared! Thank you for opening your heart.');
  showStories();
}

function loadStories() {
  const saved = localStorage.getItem('talkItOutStories');
  if (saved) {
    stories = JSON.parse(saved);
  } else {
    // Add some sample stories
    stories = [
      {
        id: 'sample1',
        title: 'Finding Light in Dark Days',
        content: 'I\'ve been struggling with anxiety for months. Some days feel impossible, but I\'m learning that it\'s okay to take things one breath at a time. #anxiety #healing',
        tags: ['anxiety', 'healing', 'hope'],
        author: 'HeartWarrior',
        authorId: 'sample_user_1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        reactions: { '❤️': 12, '🤗': 8, '💪': 15, '🌟': 6, '🙏': 9 },
        userReactions: {}
      },
      {
        id: 'sample2',
        title: 'Loneliness Doesn\'t Define Me',
        content: 'Being alone doesn\'t mean being lonely, but sometimes the silence gets loud. To anyone feeling this way - you matter, your story matters. #loneliness #connection',
        tags: ['loneliness', 'connection', 'hope'],
        author: 'SilentSoul',
        authorId: 'sample_user_2',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        reactions: { '❤️': 18, '🤗': 22, '💪': 7, '🌟': 11, '🙏': 16 },
        userReactions: {}
      }
    ];
    saveStories();
  }
}

function saveStories() {
  localStorage.setItem('talkItOutStories', JSON.stringify(stories));
}

function displayAllStories() {
  const container = document.getElementById('stories-container');
  if (stories.length === 0) {
    container.innerHTML = '<p><em>No stories yet. Be the first to share your heart!</em></p>';
    return;
  }

  container.innerHTML = stories.map(story => createStoryHTML(story)).join('');
}

function searchStories() {
  const searchInput = document.getElementById('heart-search');
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    alert('Please enter something to search for...');
    return;
  }

  const matchingStories = stories.filter(story => {
    return story.title.toLowerCase().includes(searchTerm) ||
           story.content.toLowerCase().includes(searchTerm) ||
           story.tags.some(tag => tag.includes(searchTerm));
  });

  displaySearchResults(matchingStories, searchTerm);
}

function displaySearchResults(matchingStories, searchTerm) {
  const resultsSection = document.getElementById('search-results');
  const resultsContainer = document.getElementById('results-container');
  
  if (matchingStories.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No stories found for "${searchTerm}", but your feelings are still valid.</p>
        <p>Consider sharing your own story to help others who might be going through similar experiences.</p>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = matchingStories.map(story => createStoryHTML(story)).join('');
  }
  
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function createStoryHTML(story) {
  const timeAgo = getTimeAgo(story.timestamp);
  const totalReactions = Object.values(story.reactions).reduce((a, b) => a + b, 0);
  
  return `
    <article class="story-card">
      <header>
        <h4>${escapeHtml(story.title)}</h4>
        <small>by ${escapeHtml(story.author)} • ${timeAgo}</small>
      </header>
      <div class="story-content">
        <p>${escapeHtml(story.content).replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')}</p>
      </div>
      <footer class="story-reactions">
        <div class="reaction-buttons">
          ${Object.entries(story.reactions).map(([emoji, count]) => 
            `<button class="reaction-btn ${hasUserReacted(story, emoji) ? 'reacted' : ''}" 
                     onclick="toggleReaction('${story.id}', '${emoji}')">
              ${emoji} ${count}
            </button>`
          ).join('')}
        </div>
        <small>${totalReactions} hearts touched</small>
      </footer>
    </article>
  `;
}

function hasUserReacted(story, emoji) {
  return currentUser && story.userReactions[currentUser.id] === emoji;
}

function toggleReaction(storyId, emoji) {
  if (!currentUser) {
    alert('Please log in to react to stories.');
    return;
  }

  const story = stories.find(s => s.id === storyId);
  if (!story) return;

  const userId = currentUser.id;
  const currentReaction = story.userReactions[userId];

  // Remove previous reaction if exists
  if (currentReaction) {
    story.reactions[currentReaction]--;
  }

  // Add new reaction or remove if same
  if (currentReaction === emoji) {
    delete story.userReactions[userId];
  } else {
    story.reactions[emoji]++;
    story.userReactions[userId] = emoji;
  }

  saveStories();
  
  // Refresh the current view
  if (document.getElementById('stories-section').style.display !== 'none') {
    displayAllStories();
  }
  if (document.getElementById('search-results').style.display !== 'none') {
    const searchTerm = document.getElementById('heart-search').value.trim().toLowerCase();
    const matchingStories = stories.filter(story => {
      return story.title.toLowerCase().includes(searchTerm) ||
             story.content.toLowerCase().includes(searchTerm) ||
             story.tags.some(tag => tag.includes(searchTerm));
    });
    displaySearchResults(matchingStories, searchTerm);
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
