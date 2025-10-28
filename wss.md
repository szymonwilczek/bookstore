# Specyfikacja Tekstowa Systemu Instant Book Exchange

**Wersja:** 0.1.0  
**Data:** 28 października 2025  
**Status:** Wersja robocza

## Spis Treści

1. [Wprowadzenie](#wprowadzenie)
2. [Zakres i Założenia](#zakres-i-założenia)
3. [Wymagania Funkcjonalne](#wymagania-funkcjonalne)
4. [Wymagania Niefunkcjonalne](#wymagania-niefunkcjonalne)
5. [Architektura Systemu](#architektura-systemu)
6. [Modele Danych](#modele-danych)
7. [Specyfikacja API](#specyfikacja-api)
8. [Interfejs Użytkownika](#interfejs-użytkownika)
9. [Bezpieczeństwo](#bezpieczeństwo)
10. [Testowanie i Walidacja](#testowanie-i-walidacja)
11. [Wdrożenie i Utrzymanie](#wdrożenie-i-utrzymanie)
12. [Słownik Projektu](#słownik-projektu)

## Wprowadzenie

### Cel Dokumentu

Niniejsza specyfikacja tekstowa opisuje system Instant Book Exchange - platformę webową ułatwiającą wymianę książek między użytkownikami. Dokument ma na celu zapewnienie kompletnego opisu funkcjonalności, architektury oraz wymagań systemu, umożliwiając jego dalszy rozwój, testowanie i wdrożenie.

### Opis Systemu

Instant Book Exchange to aplikacja Next.js umożliwiająca użytkownikom rejestrację, zarządzanie półkami książek (oferowanymi i żądanymi), automatyczne dopasowywanie ofert, inicjowanie transakcji wymiany oraz dodawanie recenzji. System promuje społeczności czytelników poprzez bezpieczne transakcje, wyszukiwanie książek i budowanie zaufania na podstawie ocen użytkowników. Ważne słowa kluczowe: rejestracja użytkownika, zarządzanie profilem, strona główna z dopasowanymi ofertami, wyszukiwanie, CRUD dla półek, transakcje (inicjowane przez oferującego lub odbiorcę), recenzje i oceny.

### Zakres Projektu

System obejmuje:

- Rejestrację i uwierzytelnianie użytkowników (email/hasło lub Google OAuth).
- Zarządzanie książkami: dodawanie/usuwanie z półki wymiany i listy życzeń.
- Algorytm dopasowywania ofert na podstawie listy życzeń.
- Wyszukiwanie książek po tytule/autorze.
- Transakcje wymiany z statusami: oczekująca, zaakceptowana, ukończona.
- Recenzje po transakcjach z ocenami 1-5 i komentarzami.
- Punkty dla użytkowników za ukończone transakcje.
- Responsywny interfejs użytkownika z animacjami.

Zakres nie obejmuje: płatności, wysyłki fizycznej książek, integracji z zewnętrznymi sklepami (oprócz Google Books API dla wyszukiwania).

## Zakres i Założenia

### Założenia Projektowe

- Użytkownicy mają dostęp do stabilnego połączenia internetowego.
- Książki są wymieniane fizycznie poza systemem (platforma obsługuje tylko koordynację).
- Dane użytkowników są przechowywane zgodnie z RODO (pseudonimizacja, zgoda na przetwarzanie).
- System jest skalowalny do ~10 000 użytkowników miesięcznie.
- Technologie: Next.js 15, MongoDB, NextAuth, shadcn/ui, Framer Motion.

### Ograniczenia

- Brak wsparcia dla urządzeń mobilnych poza responsywnością webową (brak aplikacji mobilnej).

## Wymagania Funkcjonalne

Wymagania funkcjonalne opisane są w postaci przypadków użycia (use cases) z aktorami, scenariuszami i alternatywnymi ścieżkami.

### UC-1: Rejestracja Użytkownika

- **Aktor:** Nowy użytkownik.
- **Warunki wstępne:** Brak konta.
- **Scenariusz główny:**
  1. Użytkownik wprowadza email, hasło i imię (pseudonim).
  2. System waliduje dane (email unikalny, hasło min. 8 znaków).
  3. System tworzy konto, haszuje hasło (bcrypt) i wysyła potwierdzenie.
- **Alternatywy:** Rejestracja przez Google OAuth – system pobiera dane z Google i tworzy konto.
- **Wyjątki:** Email już istnieje – błąd 400.

### UC-2: Logowanie Użytkownika

- **Aktor:** Zarejestrowany użytkownik.
- **Warunki wstępne:** Konto istnieje.
- **Scenariusz główny:**
  1. Użytkownik wprowadza email/hasło lub loguje przez Google.
  2. System uwierzytelnia i tworzy sesję (NextAuth).
- **Alternatywy:** Nieprawidłowe dane – błąd 401.

### UC-3: Zarządzanie Listą Życzeń

- **Aktor:** Zalogowany użytkownik.
- **Warunki wstępne:** Sesja aktywna.
- **Scenariusz główny:**
  1. Użytkownik wyszukuje książkę (Google Books API).
  2. Dodaje książkę do listy życzeń (POST /api/user/wishlist).
  3. Usuwa książkę (DELETE /api/user/wishlist).
- **Alternatywy:** Książka już istnieje – ostrzeżenie.

### UC-4: Zarządzanie Półką Wymiany

- Podobne do UC-3, ale dla oferowanych książek (POST/DELETE /api/user/offered-books).

### UC-5: Dopasowywanie Ofert

- **Aktor:** System (automatycznie).
- **Warunki wstępne:** Użytkownik ma listę życzeń.
- **Scenariusz główny:**
  1. System porównuje tytuły z półkami innych użytkowników.
  2. Zwraca top 10 dopasowań (GET /api/matches).

### UC-6: Wyszukiwanie Książek

- **Aktor:** Zalogowany użytkownik.
- **Scenariusz główny:**
  1. Użytkownik wprowadza zapytanie.
  2. System przeszukuje książki (GET /api/search).
  3. Wyświetla wyniki z opcjami propozycji wymiany.

### UC-7: Inicjowanie Transakcji

- **Aktor:** Użytkownik (oferujący lub odbiorca).
- **Scenariusz główny:**
  1. Użytkownik wybiera ofertę i proponuje wymianę (POST /api/transactions).
  2. System tworzy transakcję ze statusem "oczekująca".

### UC-8: Akceptacja i Zakończenie Transakcji

- **Aktor:** Uczestnik transakcji.
- **Scenariusz główny:**
  1. Użytkownik akceptuje (PUT /api/transactions/:id, status: "accepted").
  2. Po wymianie fizycznej kończy transakcję (status: "completed").
  3. System przyznaje punkty i aktualizuje status książki.

### UC-9: Dodawanie Recenzji

- **Aktor:** Uczestnik transakcji.
- **Scenariusz główny:**
  1. Po zakończeniu transakcji użytkownik dodaje ocenę i komentarz (POST /api/reviews).
  2. System oblicza średnią ocenę recenzowanego użytkownika.

## Wymagania Niefunkcjonalne

- **Wydajność:** Czas odpowiedzi API < 2s dla 95% zapytań; obsługa 1000 równoczesnych użytkowników.
- **Bezpieczeństwo:** Haszowanie haseł (bcrypt), sesje JWT, ochrona przed SQL injection (Mongoose), zgodność z OWASP.
- **Skalowalność:** Architektura bezstanowa, możliwość skalowania MongoDB.
- **Użyteczność:** Responsywność na urządzenia mobilne, animacje dla lepszego UX.
- **Dostępność:** 99% uptime, obsługa błędów z komunikatami.
- **Kompatybilność:** Przeglądarki: Chrome, Firefox, Safari, Edge, Brave, Opera (ostatnie wersje).

## Architektura Systemu

System opiera się na architekturze klient-serwer z Next.js jako frameworkiem full-stack.

- **Warstwa Prezentacji:** Komponenty React (klient), responsywne dzięki Tailwind CSS i wystylizowane z shadcn/ui.
- **Warstwa Aplikacji:** Next.js API routes obsługujące logikę biznesową.
- **Warstwa Danych:** MongoDB z Mongoose dla modeli; połączenie przez globalną zmienną dla cache.
- **Uwierzytelnianie:** NextAuth z providerami (Credentials, Google).
- **Integracje:** Google Books API dla wyszukiwania książek.
- **Infrastruktura:** Hosting na Vercel; zmienne środowiskowe dla kluczy API.

Diagram architektury (tekstowy):  
Klient (Browser) ↔ Next.js Server (API Routes) ↔ MongoDB  
Zewnętrzne: Google OAuth, Google Books API.

## Modele Danych

Modele zdefiniowane w Mongoose z typami TypeScript.

### Użytkownik (User)

- email: String (wymagane, unikalne)
- name: String (wymagane)
- googleId: String (opcjonalne)
- password: String (opcjonalne, zahashowane)
- wishlist: [ObjectId] (ref: Book)
- offeredBooks: [ObjectId] (ref: Book)
- points: Number (domyślnie 0)
- averageRating: Number (0-5, domyślnie 0)
- preferences: { genres: [String] }
- timestamps: true

### Książka (Book)

- title: String (wymagane)
- author: String (wymagane)
- isbn: String
- description: String
- imageUrl: String
- owner: ObjectId (ref: User, wymagane)
- status: Enum ("available", "exchanged"), domyślnie "available"
- timestamps: true

### Transakcja (Transaction)

- initiator: ObjectId (ref: User, wymagane)
- receiver: ObjectId (ref: User, wymagane)
- offeredBook: ObjectId (ref: Book, wymagane)
- wishedBook: ObjectId (ref: Book)
- status: Enum ("pending", "accepted", "completed"), domyślnie "pending"
- timestamps: true

### Recenzja (Review)

- transactionId: ObjectId (ref: Transaction, wymagane)
- reviewer: ObjectId (ref: User, wymagane)
- reviewedUser: ObjectId (ref: User, wymagane)
- rating: Number (1-5, wymagane)
- comment: String
- timestamps: true

Relacje: Użytkownik ma wiele książek; transakcja łączy użytkowników i książki; recenzja powiązana z transakcją.

## Specyfikacja API

API oparte na RESTful routes w Next.js. Wszystkie endpointy wymagają autoryzacji (NextAuth).

| Endpoint                | Metoda      | Opis                         | Parametry                                     | Odpowiedź Sukces  | Błędy               |
| ----------------------- | ----------- | ---------------------------- | --------------------------------------------- | ----------------- | ------------------- |
| /api/auth/register      | POST        | Rejestracja użytkownika      | {email, password, name}                       | {message, userId} | 400 (istnieje), 500 |
| /api/auth/[...nextauth] | GET/POST    | Logowanie/wylogowanie        | Sesja                                         | Sesja użytkownika | 401                 |
| /api/user/profile       | GET         | Pobierz profil               | -                                             | {user data}       | 401, 404            |
| /api/user/wishlist      | POST        | Dodaj do wishlisty           | {title, author, isbn, imageUrl}               | {message}         | 401, 404            |
| /api/user/wishlist      | DELETE      | Usuń z wishlisty             | {bookId}                                      | {message}         | 401, 404            |
| /api/user/offered-books | POST/DELETE | Dodaj/usuń oferowaną książkę | Podobne do wishlist                           | Podobne           | Podobne             |
| /api/matches            | GET         | Pobierz dopasowane oferty    | -                                             | [{offer}]         | 401                 |
| /api/search             | GET         | Wyszukaj książki             | ?q=query                                      | [{offer}]         | 401                 |
| /api/transactions       | POST        | Utwórz transakcję            | {offeredBookId, wishedBookId?, receiverEmail} | {transactionId}   | 401, 404            |
| /api/transactions/:id   | PUT         | Aktualizuj status            | {status}                                      | {transaction}     | 401, 403, 404       |
| /api/transactions/:id   | GET         | Pobierz transakcję           | -                                             | {transaction}     | 401, 403            |
| /api/transactions/user  | GET         | Lista transakcji użytkownika | -                                             | [{transaction}]   | 401                 |
| /api/reviews            | POST        | Dodaj recenzję               | {transactionId, rating, comment}              | {review}          | 401, 404            |

## Interfejs Użytkownika

### Ekran Główny (/)

- Nagłówek z nawigacją (Navbar: Home, Transactions, Search, Profile).
- Powitanie użytkownika.
- Lista dopasowanych ofert (MatchList) z kartami (OfferCard: tytuł, autor, właściciel, przycisk "Zaproponuj Wymianę").
- Linki do profilu i wyszukiwania.

### Ekran Profilu (/profile)

- Formularz WishlistForm: Wyszukiwarka (Google Books), wyniki, lista wishlist z przyciskami usunięcia.
- OfferedBooksList: Podobne dla oferowanych książek.
- Wyświetlanie punktów i średniej oceny.

### Ekran Wyszukiwania (/search)

- Pole wyszukiwania, przycisk "Szukaj".
- Lista wyników z OfferCard.

### Ekran Transakcji (/transactions)

- Lista transakcji użytkownika z linkami do szczegółów.

### Szczegóły Transakcji (/transaction/:id)

- Status, książki, przyciski akceptacji/zakończenia.
- Formularz recenzji (ReviewForm: ocena, komentarz) po zakończeniu.

Komponenty: Responsywne, z animacjami (Framer Motion), błędy wyświetlane jako alerty.

## Bezpieczeństwo

- **Uwierzytelnianie:** NextAuth z JWT; hasła haszowane bcrypt (12 rund).
- **Autoryzacja:** Sprawdzanie sesji dla API; właściciela dla zasobów.
- **Ochrona Danych:** Pseudonimizacja email; szyfrowanie w MongoDB.
- **Zgodność:** Brak wrażliwych danych; logowanie błędów bez szczegółów.
- **Zagrożenia:** Ochrona przed XSS (sanitize input), CSRF (NextAuth), injection (Mongoose).

## Testowanie i Walidacja

- **Strategia:** Testy jednostkowe (Jest) dla modeli i API; integracyjne dla workflow; E2E (Playwright) dla UI.
- **Przypadki Testowe:** UC-1 do UC-9 z pozytywnymi/negatywnymi scenariuszami.
- **Kryteria Akceptacji:** Wszystkie testy przechodzą; pokrycie kodu >80%.
- **Walidacja:** Recenzje użytkowników w fazie beta.

## Wdrożenie i Utrzymanie

- **Środowisko:** Development (lokalne), Staging (Vercel preview), Production (Vercel).
- **Zmienne Środowiskowe:** MONGODB_URI, GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_SECRET, GOOGLE_BOOKS_API_KEY.
- **Deployment:** Automatyczny przez GitHub Actions; backup MongoDB codzienny.
- **Monitorowanie:** Logi błędów (console), uptime monitoring.
- **Utrzymanie:** Aktualizacje zależności; skalowanie na podstawie użycia.

## Słownik Projektu

**Akceptacja transakcji**: Proces potwierdzania oferty wymiany przez odbiorcę książki.  
**Algorytm dopasowywania**: Mechanizm systemu analizujący listy życzeń użytkowników w celu zaproponowania pasujących ofert.  
**Animacje**: Efekty wizualne (np. Framer Motion) poprawiające UX.  
**API Route**: Endpoint w Next.js obsługujący żądania HTTP.  
**Architektura klient-serwer**: Model systemu z oddzieleniem prezentacji i logiki.  
**Autoryzacja**: Sprawdzanie uprawnień użytkownika do zasobów.  
**Dopasowanie ofert**: Wynik działania algorytmu, proponujący książki z półek innych użytkowników na podstawie listy życzeń.  
**Gatunek książki**: Preferencja użytkownika, używana do rozszerzania dopasowań (np. fantasy, kryminał).  
**Google Books API**: Zewnętrzna usługa do wyszukiwania książek.  
**Haszowanie**: Proces zabezpieczania haseł (bcrypt).  
**Inicjator transakcji**: Użytkownik rozpoczynający proces wymiany książki.  
**Instant Book Exchange**: Nazwa systemu platformy webowej do wymiany książek.  
**JWT**: JSON Web Token używany w sesjach NextAuth.  
**Książka**: Przedmiot wymiany, zawierający tytuł, autora, ISBN, opis i obrazek.  
**Lista życzeń**: Zbiór książek, które użytkownik chce otrzymać w zamian.  
**Mongoose**: Biblioteka ODM dla MongoDB.  
**NextAuth**: Biblioteka do uwierzytelniania w Next.js.  
**Odbiorca książki**: Użytkownik otrzymujący książkę w transakcji.  
**Oceniany użytkownik**: Partner wymiany, którego ocenia recenzent po transakcji.  
**Ocena średnia**: Średnia wartość recenzji użytkownika, obliczana na podstawie wszystkich ocen.  
**Oferowana książka**: Książka z półki wymiany użytkownika, dostępna do wymiany.  
**Oferujący książkę**: Użytkownik udostępniający książkę do wymiany.  
**Półka wymiany**: Zbiór książek oferowanych przez użytkownika do wymiany.  
**Punkty użytkownika**: Nagroda za ukończone transakcje, zwiększająca reputację.  
**Recenzent**: Użytkownik dodający recenzję po transakcji.  
**Recenzja**: Ocena (1-5 gwiazdek) i opcjonalny komentarz dotyczący partnera wymiany.  
**Rejestracja użytkownika**: Proces tworzenia konta w systemie.  
**Responsywność**: Dostosowanie interfejsu do różnych urządzeń.  
**Sesja**: Aktywna autoryzacja użytkownika w systemie.  
**shadcn/ui**: Biblioteka komponentów UI.  
**Status książki**: Stan książki ("dostępna" lub "wymieniona").  
**Status transakcji**: Etap wymiany ("oczekująca", "zaakceptowana", "ukończona").  
**Tailwind CSS**: Framework do stylizacji.  
**Transakcja wymiany**: Proces wymiany książek między dwoma użytkownikami.  
**TypeScript**: Język programowania z typami statycznymi.  
**Uwierzytelnianie**: Weryfikacja tożsamości użytkownika.  
**Użytkownik**: Osoba zarejestrowana w systemie, posiadająca profil, półkę i listę życzeń.  
**Wishlist**: Synonim listy życzeń.  
**Workflow**: Sekwencja kroków w procesie użytkownika.  
**Wyszukiwanie ofert**: Funkcjonalność przeglądania dostępnych książek po tytule lub autorze.  
**Zakończenie transakcji**: Finalizacja wymiany, po której książka zmienia status i przyznawane są punkty.  
**Żądana książka**: Książka z listy życzeń odbiorcy, wymieniana w transakcji.
