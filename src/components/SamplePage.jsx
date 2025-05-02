import React from "react";

export default function SamplePage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to Sample Page</h1>
        <nav style={styles.nav}>
          <a href="#section1" style={styles.navLink}>
            Section 1
          </a>
          <a href="#section2" style={styles.navLink}>
            Section 2
          </a>
          <a href="#section3" style={styles.navLink}>
            Section 3
          </a>
        </nav>
      </header>

      <main style={styles.main}>
        <section id="section1" style={styles.section}>
          <h2 style={styles.sectionTitle}>Section 1: Introduction</h2>
          <p style={styles.paragraph}>
            This is a sample introduction paragraph. Use our{" "}
            <a href="https://example.com" style={styles.link}>
              link
            </a>{" "}
            to learn more.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>First item</li>
            <li style={styles.listItem}>Second item</li>
            <li style={styles.listItem}>Third item</li>
          </ul>
        </section>

        <section id="section2" style={styles.section}>
          <h2 style={styles.sectionTitle}>Section 2: Form</h2>
          <div style={styles.form}>
            <label htmlFor="name" style={styles.label}>
              Name:
            </label>
            <input
              id="name"
              placeholder="Enter your name"
              style={styles.input}
            />
            <label htmlFor="email" style={styles.label}>
              Email:
            </label>
            <input
              id="email"
              placeholder="Enter your email"
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Submit
            </button>
          </div>
        </section>

        <section id="section3" style={styles.section}>
          <h2 style={styles.sectionTitle}>Section 3: Image & Card</h2>
          <img
            src="https://via.placeholder.com/150"
            alt="Placeholder"
            style={styles.image}
          />
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Card Title</h3>
            <p style={styles.paragraph}>Some card content goes here.</p>
            <button style={styles.cardButton}>Learn More</button>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2025 Example Inc.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: { padding: 16, backgroundColor: "#ffffff" },
  header: {
    padding: 16,
    backgroundColor: "#eeeeee",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderStyle: "solid",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { margin: 0, color: "#222222", fontSize: 24, fontWeight: "bold" },
  nav: { display: "flex", flexDirection: "row" },
  navLink: { marginRight: 16, color: "#007acc", textDecoration: "none" },
  main: { padding: 16, backgroundColor: "#ffffff" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333333",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    color: "#444444",
  },
  link: { color: "#007acc", textDecoration: "underline" },
  list: { paddingLeft: 16, marginBottom: 8 },
  listItem: { fontSize: 16, marginBottom: 4, color: "#444444" },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: 16, marginBottom: 4, color: "#222222" },
  input: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderStyle: "solid",
    borderRadius: 4,
    marginBottom: 12,
  },
  button: {
    padding: 12,
    backgroundColor: "#007acc",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: 4,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
  },
  image: { width: 150, height: 150, marginBottom: 16 },
  card: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderStyle: "solid",
    borderRadius: 8,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222222",
  },
  cardButton: {
    padding: 8,
    backgroundColor: "#cc0033",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: 4,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
  },
  footer: {
    padding: 16,
    backgroundColor: "#eeeeee",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    borderStyle: "solid",
    textAlign: "center",
  },
  footerText: { margin: 0, color: "#555555", fontSize: 14 },
};
