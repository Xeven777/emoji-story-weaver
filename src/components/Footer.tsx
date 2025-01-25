const Footer = () => {
  return (
    <footer>
      <div className="container flex items-center justify-between mx-auto px-4 md:px-12 py-8 text-center text-sm text-muted-foreground">
        <p>
          🌟Star on{" "}
          <a
            href="https://github.com/Xeven777/emoji-story-weaver"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Github
          </a>
        </p>

        <p>
          Made with ❤️ by{" "}
          <a
            href="https://anish7.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Anish
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
