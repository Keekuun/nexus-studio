import { nanoid } from "nanoid";
import { CustomElement } from "./registry";

// Helper to create nodes
const text = (content: string) => ({ text: content });
const voidText = () => ({ text: "" });

export const MOCK_DOC_DATA: CustomElement[] = [
  // Section 1: Intro
  {
    type: "section",
    id: "sec_intro",
    background: "bg-white",
    children: [
      {
        type: "heading",
        id: "h1_main",
        level: 1,
        align: "center",
        children: [text("Design System Specification")],
      },
      {
        type: "paragraph",
        id: "p_intro",
        align: "center",
        children: [
          text(
            "A comprehensive guide to our atomic and molecular component library."
          ),
        ],
      },
    ],
  },

  // Section 2: Atoms Showcase
  {
    type: "section",
    id: "sec_atoms",
    children: [
      {
        type: "heading",
        id: "h2_atoms",
        level: 2,
        children: [text("1. Atomic Components")],
      },
      {
        type: "paragraph",
        id: "p_atoms_desc",
        children: [
          text("These are the indivisible building blocks of our UI."),
        ],
      },
      // Gallery of Atoms
      {
        type: "gallery",
        id: "gal_atoms",
        columns: 3,
        children: [
          {
            type: "card",
            id: "card_atom_1",
            padding: "sm",
            children: [
              {
                type: "image",
                id: "img_atom_1",
                src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80",
                caption: "Abstract 3D",
                children: [voidText()],
              },
              {
                type: "tag",
                id: "tag_1",
                label: "Image Atom",
                color: "blue",
                children: [voidText()],
              },
            ],
          },
          {
            type: "card",
            id: "card_atom_2",
            padding: "sm",
            children: [
              {
                type: "video",
                id: "vid_atom_1",
                src: "https://www.w3schools.com/html/mov_bbb.mp4",
                children: [voidText()],
              },
              {
                type: "tag",
                id: "tag_2",
                label: "Video Atom",
                color: "red",
                children: [voidText()],
              },
            ],
          },
          {
            type: "card",
            id: "card_atom_3",
            padding: "sm",
            children: [
              {
                type: "audio",
                id: "aud_atom_1",
                src: "https://www.w3schools.com/html/horse.mp3",
                children: [voidText()],
              },
              {
                type: "tag",
                id: "tag_3",
                label: "Audio Atom",
                color: "green",
                children: [voidText()],
              },
            ],
          },
        ],
      },
    ],
  },

  // Section 3: Molecules (Composites)
  {
    type: "section",
    id: "sec_molecules",
    background: "bg-slate-50",
    children: [
      {
        type: "heading",
        id: "h2_mol",
        level: 2,
        children: [text("2. Molecular Components")],
      },
      {
        type: "paragraph",
        id: "p_mol_desc",
        children: [
          text(
            "Complex components built by combining atoms. Try hovering the container vs the inner items."
          ),
        ],
      },
      // Story Card (Complex Composite)
      {
        type: "story-card",
        id: "story_1",
        layout: "horizontal",
        children: [
          {
            type: "image",
            id: "story_img_1",
            src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
            children: [voidText()],
          },
          {
            type: "card",
            id: "story_content_1",
            variant: "outlined", // Nested card for content structure
            children: [
              {
                type: "tag",
                id: "story_tag_1",
                label: "Featured Story",
                color: "blue",
                children: [voidText()],
              },
              {
                type: "heading",
                id: "story_title_1",
                level: 3,
                children: [text("The Future of Digital Collaboration")],
              },
              {
                type: "paragraph",
                id: "story_p_1",
                children: [
                  text(
                    "How remote teams are using new tools to bridge the physical gap and maintain creative velocity."
                  ),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
