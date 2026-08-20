declare module "layout-bmfont-text" {
  interface Glyph {
    position: [number, number];
    data: {
      x: number;
      y: number;
      width: number;
      height: number;
      xoffset: number;
      yoffset: number;
      xadvance: number;
      page: number;
    };
  }
  interface Layout {
    glyphs: Glyph[];
    width: number;
    height: number;
    baseline: number;
  }
  interface BMFontChar {
    id: number;
    index: number;
    char: string;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    x: number;
    y: number;
    page: number;
  }
  interface BMFont {
    info: { size: number };
    common: { lineHeight: number; scaleW: number; scaleH: number };
    chars: BMFontChar[];
  }
  interface Options {
    font: BMFont;
    text: string;
    size?: number;
    letterSpacing?: number;
    lineHeight?: number;
    align?: "left" | "center" | "right";
    tabSize?: number;
    maxWidth?: number;
  }
  export default function createLayout(options: Options): Layout;
}