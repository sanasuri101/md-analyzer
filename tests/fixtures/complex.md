# Complex Markdown Test Fixture

## Introduction

This document demonstrates various Markdown elements including headers, lists, tables, code blocks, and links.

### Headers Overview

Markdown supports six levels of headers:

# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Lists

### Unordered Lists

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
    - Sub-subitem 2.2.1
- Item 3

### Ordered Lists

1. First item
2. Second item
   1. Subitem 2.1
   2. Subitem 2.2
3. Third item

### Mixed Lists

- Level 1
  1. Level 2 (ordered)
     - Level 3 (unordered)
        1. Level 4 (ordered)

## Code Blocks

### Inline Code

This is an example of `inline code` within a paragraph.

### Fenced Code Blocks

python
def greet(name):
    """Simple greeting function"""
    return f"Hello, {name}!"

# Example usage
print(greet("World"))

### Code Block with Syntax Highlighting

javascript
function calculateSum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}

console.log(calculateSum([1, 2, 3, 4, 5])); // Output: 15

## Tables

### Basic Table

| Name | Age | Occupation |
|------|-----|------------|
| John | 30  | Developer  |
| Jane | 28  | Designer   |
| Bob  | 35  | Manager    |

### Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| Left         |     Center     |         Right |
| Left         |     Center     |         Right |
| Left         |     Center     |         Right |

### Complex Table with Headers

| Product | Price | In Stock | Description |
|---------|-------|----------|-------------|
| Apple   | $0.99 | Yes      | Red delicious apples |
| Orange  | $1.19 | No       | Fresh oranges from Florida |
| Banana  | $0.59 | Yes      | Yellow bananas, organic |

## Links

### Inline Links

[GitHub](https://github.com) is a popular platform for hosting code.

### Reference Links

This is [a reference-style link][1] and this is [another][2].

[1]: https://example.com "Example Link 1"
[2]: https://example.org "Example Link 2"

### Automatic Links

<https://example.com> is an automatic link.

### Links with Images

![Markdown Logo](https://markdown-here.com/img/icon256.png "Markdown Logo")

## Blockquotes

> This is a blockquote.
> 
> > This is a nested blockquote.
> 
> > > This is a deeply nested blockquote.

## Horizontal Rules

---

***

___

## Emphasis

### Bold

**Bold text** can also be written as __bold text__.

### Italic

*Italic text* can also be written as _italic text_.

### Bold and Italic

***Bold and italic text*** can also be written as ___bold and italic text___.

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
  - [ ] Subtask

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.