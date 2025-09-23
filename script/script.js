// Preloaded info about me
const knowledgeBase = [
  {
    keywords: ["skills", "technology", "tech", "languages", "stack"],
    answer: "✨ Lois is skilled in JavaScript, Java, Python, SQL, MySQL, PostgreSQL, HTML, CSS, and responsive website development. She has experience in front-end and back-end programming, UX design, database management, and version control with Git/GitHub."
  },
  {
    keywords: ["projects", "work", "portfolio", "project1", "project2", "project3"],
    answer: "💻 Lois has worked on: (1) a Business Plan project with a $49K marketing strategy and financial forecasting, (2) a MySQL database for a dog daycare that improved data efficiency by 40%, and (3) the Triple Peaks Library website using HTML/CSS that cut load time by 25%."
  },
  {
    keywords: ["bio", "about", "information", "who are you"],
    answer: "Hi! Lois is an Information Science major at SUNY Oswego with a double minor in Business Administration and Entrepreneurship. She’s passionate about full-stack web development, design, and creating elegant, user-friendly websites."
  },
  {
    keywords: ["education", "school", "college", "degree"],
    answer: "🎓 Lois is pursuing a B.A. in Information Science at SUNY Oswego, graduating May 2026. Her coursework includes Data Structures & Algorithms, Database Management, Programming Languages, and Systems Programming. She is also completing the TripleTen Software Engineering Certification (Jan–Nov 2025)."
  },
  {
    keywords: ["experience", "jobs", "internship", "work history"],
    answer: "📌 Lois has experience as a CSTEP Mentor at SUNY Oswego, where she boosted student performance by 25% through tutoring and coaching. She was also a Fellow at The Takeoff Institute, collaborating on real-world product challenges and presenting findings to professionals."
  },
  {
    keywords: ["organizations", "clubs", "activities", "groups", "societies", "nsbe", "colorstack"],
    answer: "🤝 Lois is active in the National Society of Black Engineers (NSBE), where she has served as Senator, Public Relations, and Vice President. She is also a member of ColorStack, a national community supporting Black and Latinx computer science students."
  },
  {
    keywords: ["goals", "career", "future", "plans"],
    answer: "🚀 Lois’s short-term goal is to secure a Full-Stack Web Developer role after graduation in 2026. Long-term, she aims to become a Senior Developer within 3–5 years, contributing to innovative and user-centered projects."
  },
  {
    keywords: ["soft skills", "strengths", "qualities"],
    answer: "🌟 Lois’s strengths include problem-solving, adaptability, creativity, leadership, teamwork, and communication. She has applied these skills in mentoring, student leadership, and technical projects."
  },
  {
    keywords: ["interests", "hobbies", "fun", "outside of tech"],
    answer: "🎶 Lois enjoys creating YouTube and TikTok content, solo adventures, self-care routines, and visual diaries. She also values faith-based community and creative expression."
  },
  {
    keywords: ["travel", "vacation", "trip"],
    answer: "✈️ Lois wants to visit every continent at least once."
  },
  {
    keywords: ["favorite color", "colors"],
    answer: "🎨 Lois loves green, black, gold, and butter yellow."
  },
  {
    keywords: ["hi", "hello", "hey", "greetings"],
    answer: "Hey! 👋 Thanks for visiting Lois’s portfolio!"
  },
  {
    keywords: ["contact", "email", "reach", "linkedin", "github", "resume"],
    answer: "💌 Please contact Lois using the form at the bottom of the page."
  },
  {
    keywords: ["fun fact", "something random", "unique"],
    answer: "🍰 Fun fact: Lois has been learning to bake after burning brownies 5 years ago. Don’t ask why."
  }
];

// Function to handle user input
function askAI() {
  const input = document.getElementById("user-input").value.trim();
  const chatBox = document.getElementById("chat-box");

  if (!input) return;

  let reply = "💌 Please contact Lois using the form at the bottom of the page.";

  // Check knowledge base for matching keywords
  for (let item of knowledgeBase) {
    for (let keyword of item.keywords) {
      if (input.toLowerCase().includes(keyword)) {
        reply = item.answer;
        break;
      }
    }
    if (reply !== "💌 Please contact Lois using the form at the bottom of the page.") {
      break;
    }
  }

  // Display conversation in chat box
  chatBox.innerHTML += `<p><b>You:</b> ${input}</p>`;
  chatBox.innerHTML += `<p><b>AI:</b> ${reply}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  // Clear input
  document.getElementById("user-input").value = "";
}

// Fill input with example question
function fillExample(text) {
  document.getElementById("user-input").value = text;
  askAI();
}
