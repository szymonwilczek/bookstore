export const BISAC_CATEGORIES = [
  "FICTION / Fantasy / General",
  "FICTION / Science Fiction / General",
  "FICTION / Romance / General",
  "FICTION / Thrillers / General",
  "FICTION / Mystery & Detective / General",
  "FICTION / Horror",
  "NONFICTION / Biography & Autobiography",
  "NONFICTION / History / General",
  "NONFICTION / Self-Help / General",
  "NONFICTION / Science / General",
  "FICTION / Literary",
  "FICTION / Historical",
  "YOUNG ADULT FICTION / Fantasy / General",
  "YOUNG ADULT FICTION / Romance / General",
  "JUVENILE FICTION / Fantasy & Magic",
] as const;

export const GENRE_DISPLAY_MAP: Record<string, string> = {
  "FICTION / Fantasy / General": "Fantasy",
  "FICTION / Science Fiction / General": "Science Fiction",
  "FICTION / Romance / General": "Romance",
  "FICTION / Thrillers / General": "Thriller",
  "FICTION / Mystery & Detective / General": "Mystery",
  "FICTION / Horror": "Horror",
  "NONFICTION / Biography & Autobiography": "Biography",
  "NONFICTION / History / General": "History",
  "NONFICTION / Self-Help / General": "Self-Help",
  "NONFICTION / Science / General": "Science",
  "FICTION / Literary": "Literary Fiction",
  "FICTION / Historical": "Historical Fiction",
  "YOUNG ADULT FICTION / Fantasy / General": "YA Fantasy",
  "YOUNG ADULT FICTION / Romance / General": "YA Romance",
  "JUVENILE FICTION / Fantasy & Magic": "Children's Fantasy",
};

export function simplifyGenre(genre: string): string {
  return GENRE_DISPLAY_MAP[genre] || genre.split("/").pop()?.trim() || genre;
}
