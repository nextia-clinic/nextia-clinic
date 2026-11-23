# Review page

A tiny, dependency-free tool to review a Markdown document from your phone on
the home Wi-Fi. Each requirement gets an **Approve** button and a **comment**
box; answers autosave to a JSON file.

## Run it

```sh
node tools/review-page/server.js
```

Defaults: reviews `docs/plan.md`, saves to `docs/plan-review.json`, on port `7421`.
The console prints a `http://<home-ip>:7421` address to open on your phone.

### Reuse for another document

```sh
node tools/review-page/server.js --doc docs/other.md --out docs/other-review.json --port 8788
```

## How it reads a document

It splits the file on `## ` headings. In a section with a bullet or numbered
list, each list item is one requirement. In a section with only prose, each
paragraph is one requirement. The title and intro text are skipped.

## Safety

- Serves only to private/home network addresses (10.x, 192.168.x, 172.16–31.x)
  and localhost. Any other caller gets `403`. It is not exposed to the internet.
- It renders only the text of the document you point it at. Keep real people's
  data out of that document.
