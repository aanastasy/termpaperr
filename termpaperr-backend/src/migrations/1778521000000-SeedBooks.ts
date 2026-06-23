import { MigrationInterface, QueryRunner } from "typeorm";

const SEED_BOOKS = [
  {
    title: "1984",
    author: "Джордж Орвелл",
    genre: "Антиутопія",
    rating: "4.00",
    coverUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    description: "Антиутопічний роман про тоталітарне суспільство.",
    price: "250.00",
    availableSpots: 12,
  },
  {
    title: "Гаррі Поттер",
    author: "Дж. К. Роулінг",
    genre: "Фентезі",
    rating: "5.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9781526626585_312296.png",
    description: "Пригодницьке фентезі про юного чарівника.",
    price: "500.00",
    availableSpots: 8,
  },
  {
    title: "Хоббіт",
    author: "Дж. Р. Р. Толкін",
    genre: "Фентезі",
    rating: "5.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9780007458424_0.jpg",
    description: "Подорож хоббіта Більбо до Самотньої гори.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Дракула",
    author: "Брем Стокер",
    genre: "Трилери та жахи",
    rating: "4.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9781435159570_0.jpg",
    description: "Класичний готичний роман про графа Дракулу.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Вище неба",
    author: "Ліз Томфорд",
    genre: "Романтична проза",
    rating: "4.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9781399728546_0.jpg",
    description: "Романтична історія про любов і втрату.",
    price: "300.00",
    availableSpots: 10,
  },
  {
    title: "Четверте крило",
    author: "Реббека Яррос",
    genre: "Фентезі",
    rating: "3.00",
    coverUrl: "https://covers.openlibrary.org/b/id/14588041-L.jpg",
    description: "Фентезі про навчання в військовій академії драконів.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Хімія смерті",
    author: "Саймон Бекетт",
    genre: "Детектив",
    rating: "4.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/8/1/81ep9fesdpl.jpg",
    description: "Детективний роман про розслідування загадкових смертей.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Гордість та упередження",
    author: "Джейн Остін",
    genre: "Класична література",
    rating: "5.00",
    coverUrl: "https://i.ebayimg.com/images/g/M2gAAeSwh5ZpN41B/s-l1600.jpg",
    description: "Класичний роман про кохання та суспільні упередження.",
    price: "350.00",
    availableSpots: 10,
  },
  {
    title: "Полювання на Аделіну",
    author: "Х. Д. Карлтон",
    genre: "Сучасна література",
    rating: "3.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9781957635019_0.jpg",
    description: "Сучасний роман із елементами трилеру.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Той, що біжить лабіринтом",
    author: "Джеймс Дешнер",
    genre: "Фантастика",
    rating: "4.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9781909489400_0.jpg",
    description: "Постапокаліптична фантастика про групу підлітків.",
    price: "300.00",
    availableSpots: 10,
  },
  {
    title: "Голос Арчера",
    author: "Міа Шерідан",
    genre: "Романтична проза",
    rating: "4.00",
    coverUrl:
      "https://sens.in.ua/content/images/17/658x1000l95mc0/archers-voice-89720204436808.jpg",
    description: "Романтична історія про зцілення та довіру.",
    price: "350.00",
    availableSpots: 10,
  },
  {
    title: "Камінь. Ножиці. Папір",
    author: "Еліс Фіні",
    genre: "Трилери та жахи",
    rating: "4.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/9/7/9780008370985_0.jpg",
    description: "Психологічний трилер із непередбачуваним сюжетом.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Танець недоумка",
    author: "Ілларіон Павлюк",
    genre: "Фантастика",
    rating: "5.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/3/0/30_1_16.jpg",
    description: "Український роман про памʼять і ідентичність.",
    price: "250.00",
    availableSpots: 10,
  },
  {
    title: "Макстон-хол. Врятуй мене",
    author: "Мона Кастен",
    genre: "Романтична проза",
    rating: "3.00",
    coverUrl:
      "https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/7/3/73_1_19.jpg",
    description: "Романтична драма про складні стосунки.",
    price: "250.00",
    availableSpots: 10,
  },
];

export class SeedBooks1778521000000 implements MigrationInterface {
  name = "SeedBooks1778521000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "books"`,
    )) as Array<{ count: number }>;

    if ((rows[0]?.count ?? 0) > 0) {
      return;
    }

    for (const book of SEED_BOOKS) {
      await queryRunner.query(
        `INSERT INTO "books" ("title", "author", "genre", "rating", "cover_url", "description", "price", "available_spots")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          book.title,
          book.author,
          book.genre,
          book.rating,
          book.coverUrl,
          book.description,
          book.price,
          book.availableSpots,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const book of SEED_BOOKS) {
      await queryRunner.query(`DELETE FROM "books" WHERE "title" = $1`, [
        book.title,
      ]);
    }
  }
}
