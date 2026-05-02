import type { UniversityTemplate } from "../../mockData";

/**
 * Пять дополнительных вузов РК для каталога QApp.
 * Факультеты и описания ориентированы на открытые разделы «Структура / институты» официальных сайтов.
 */

export const ADDITIONAL_KAZAKHSTAN_UNIVERSITIES: UniversityTemplate[] = [
  {
    id: "enu",
    name: "L.N. Gumilyov Eurasian National University",
    city: "Astana, Kazakhstan",
    foundedYear: 1996,
    type: "Comprehensive",
    languagesOfInstruction: ["Kazakh", "Russian", "English"],
    applicationDeadline: "2026-08-15",
    scholarshipBlurb:
      "Государственные образовательные гранты, ректорские стипендии и поддержка одарённых студентов по профилям (уточняйте на приёмной кампании года).",
    heroImageUrl:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1800&q=72",
    tuitionOverview: {
      minKzt: 1_400_000,
      maxKzt: 3_200_000,
      note: "Ориентир контрактной оплаты по крупным факультетам; грантовые места — по конкурсу ЕНТ/внутренним правилам года.",
    },
    faculties: [
      {
        id: "enu-engineering",
        name: "Faculty of Engineering",
        description:
          "Машиностроение, энергетика, транспорт и материаловедение; проектные семестры и связь с промышленностью Астаны и регионов.",
      },
      {
        id: "enu-it",
        name: "Faculty of Information Technologies",
        description:
          "Информатика, программная инженерия, сети и информационные системы; хакатоны и лаборатории с ИТ-партнёрами.",
      },
      {
        id: "enu-law",
        name: "Faculty of Law",
        description:
          "Гражданское, уголовное и административное право; судебная практика, юридическая клиника и мот-к турниры.",
      },
      {
        id: "enu-econ",
        name: "Faculty of Economics and Business",
        description:
          "Экономическая теория, финансы, менеджмент и предпринимательство; аналитика рынков и проекты для малого бизнеса.",
      },
      {
        id: "enu-history",
        name: "Faculty of History and Archeology",
        description:
          "История Казахстана и Евразии, археология степи, музейное дело и работа с культурным наследием.",
      },
      {
        id: "enu-philology",
        name: "Faculty of Philology",
        description:
          "Филология казахского, русского и иностранных языков; перевод, литература и методика преподавания.",
      },
      {
        id: "enu-international",
        name: "Faculty of International Relations",
        description:
          "Мировая политика, дипломатия, региональная безопасность и международное право; модели межгосударственных организаций.",
      },
      {
        id: "enu-natural",
        name: "Faculty of Natural Sciences",
        description:
          "Биология, химия, география и экология; полевые практики и подготовка к научным школам университета.",
      },
      {
        id: "enu-social",
        name: "Faculty of Social Sciences",
        description:
          "Социология, политология, социальная работа и управление социальными программами.",
      },
      {
        id: "enu-math",
        name: "Faculty of Mathematics and Cybernetics",
        description:
          "Математический анализ, дискретная математика, математическое моделирование и основы кибернетики.",
      },
      {
        id: "enu-sport",
        name: "Faculty of Physical Culture and Sport",
        description:
          "Тренерская деятельность, спортивная медицина основ и управление физкультурно-оздоровительной деятельностью.",
      },
      {
        id: "enu-journalism",
        name: "Faculty of Journalism",
        description:
          "Медиакоммуникации, цифровая журналистика, медиаменеджмент и медиатворчество.",
      },
    ],
    admissionExpectations: {
      gpaScaleMax: 5.0,
      strongGpa: 4.2,
      competitiveGpa: 3.65,
      competitiveSat: 1120,
      targetSat: 1300,
      competitiveUnt: 92,
      targetUnt: 112,
      minIelts: 5.5,
      modelNote:
        "ЕНУ — крупный классический университет столицы; конкурс на грант высокий. Fit-модель учитывает UNT и языковые пороги программы.",
    },
    scholarships: [
      {
        name: "Государственный образовательный грант",
        requirements: "Конкурс ЕНТ для граждан РК по правилам года набора.",
        aiRelevance: "High",
      },
      {
        name: "Ректорская стипендия за успеваемость",
        requirements: "Топ по GPA курса; продление при сохранении результатов.",
        aiRelevance: "Medium",
      },
    ],
    programs: [
      {
        id: "enu-bsc-it",
        name: "BSc in Information Systems",
        facultyId: "enu-it",
        annualTuitionKzt: 2_450_000,
        field: "Engineering",
        degree: "Bachelor",
        durationYears: 4,
        language: "Russian / Kazakh",
        fitScore: 76,
        matchReason: "Прикладной IT для тех, кто хочет связать программирование с аналитикой и бизнес-процессами.",
        detailedDescription: ["Базы данных, веб, основы управления проектами.", "Практики в ИТ-компаниях региона."],
        entryRequirements: ["ЕНТ по профильным предметам", "Информатика приветствуется", "Уровень языка по потоку"],
      },
      {
        id: "enu-bsc-economics",
        name: "BSc in Economics",
        facultyId: "enu-econ",
        annualTuitionKzt: 2_100_000,
        field: "Business",
        degree: "Bachelor",
        durationYears: 4,
        language: "Kazakh / Russian",
        fitScore: 74,
        matchReason: "Экономическая аналитика и финансы для поступающих с сильной математикой.",
        detailedDescription: ["Микро- и макроэкономика, метрика, работа с данными."],
        entryRequirements: ["Математика в сертификате", "Конкурсный балл ЕНТ"],
      },
      {
        id: "enu-ba-law",
        name: "LL.B. in Law",
        facultyId: "enu-law",
        annualTuitionKzt: 2_350_000,
        field: "Law",
        degree: "Bachelor",
        durationYears: 4,
        language: "Russian / Kazakh",
        fitScore: 72,
        matchReason: "Базовое юридическое образование с акцентом на законодательство РК.",
        detailedDescription: ["Теория права, материальное и процессуальное право.", "Практика в юридической клинике."],
        entryRequirements: ["История и обществознание", "Конкурс ЕНТ"],
      },
    ],
  },
  {
    id: "satbayev",
    name: "Satbayev University",
    city: "Almaty, Kazakhstan",
    foundedYear: 1934,
    type: "Technical",
    languagesOfInstruction: ["Kazakh", "Russian", "English"],
    applicationDeadline: "2026-07-25",
    scholarshipBlurb:
      "Технические гранты и социальные льготы по квотам, ректорские поощрения для отличников и научных стипендий (по правилам года).",
    heroImageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1800&q=72",
    tuitionOverview: {
      minKzt: 2_800_000,
      maxKzt: 5_500_000,
      note: "Инженерные программы и ИТ — в верхней части вилки; уточняйте по выбранному институту.",
    },
    faculties: [
      {
        id: "sat-gmi",
        name: "Institute of Geology and Exploration",
        description:
          "Разведка полезных ископаемых, геохимия, геофизика и картографирование недр; полевые сезоны и лаборатории минералогии.",
      },
      {
        id: "sat-oil",
        name: "Institute of Oil and Gas",
        description:
          "Бурение, разработка месторождений, транспорт и переработка углеводородов; стандарты безопасности и экологии.",
      },
      {
        id: "sat-met",
        name: "Institute of Metallurgy and Ore Beneficiation",
        description:
          "Пиро- и гидрометаллургия, обогащение руд, материаловедение для машиностроения и энергетики.",
      },
      {
        id: "sat-arch",
        name: "Institute of Architecture and Construction",
        description:
          "Архитектура, градостроительство, инженерные конструкции и BIM-проектирование.",
      },
      {
        id: "sat-ict",
        name: "Institute of Information and Communication Technologies",
        description:
          "Software engineering, кибербезопасность, телеком и интеллектуальные системы; индустриальные партнёры IT-сектора.",
      },
      {
        id: "sat-energy",
        name: "Institute of Power Engineering and Ecology",
        description:
          "Электроэнергетика, возобновляемые источники, теплоэнергетика и экологический мониторинг.",
      },
      {
        id: "sat-mech",
        name: "Institute of Mechanical Engineering",
        description:
          "Машиностроение, робототехника, технологические машины и оборудование для промышленности.",
      },
      {
        id: "sat-trans",
        name: "Institute of Transport and Highway Engineering",
        description:
          "Транспортные системы, логистика, дорожные покрытия и безопасность движения.",
      },
      {
        id: "sat-chem",
        name: "Institute of Chemical Engineering",
        description:
          "Химическая технология органических и неорганических процессов; катализ и переработка сырья.",
      },
      {
        id: "sat-econ",
        name: "Faculty of Economics and Business",
        description:
          "Инженерная экономика, управление проектами и предпринимательство в технологическом секторе.",
      },
      {
        id: "sat-safety",
        name: "Institute of Industrial Safety and Environmental Engineering",
        description:
          "Охрана труда, промышленная безопасность и управление рисками на производстве.",
      },
      {
        id: "sat-nuclear",
        name: "Institute of Nuclear Engineering and Physics",
        description:
          "Ядерная физика, радиационная безопасность и атомные технологии — для подготовки к отраслевым стандартам.",
      },
    ],
    admissionExpectations: {
      gpaScaleMax: 5.0,
      strongGpa: 4.35,
      competitiveGpa: 3.85,
      competitiveSat: 1250,
      targetSat: 1420,
      competitiveUnt: 102,
      targetUnt: 120,
      minIelts: 6.0,
      modelNote:
        "Флагман инженерного образования; высокие ожидания по математике и физике. Англоязычные потоки — от IELTS 6.0.",
    },
    scholarships: [
      {
        name: "Грант Министерства наума и высшего образования",
        requirements: "Конкурс ЕНТ и льготные категории по правилам года.",
        aiRelevance: "High",
      },
      {
        name: "Стипендия имени выдающихся учёных (учебная)",
        requirements: "Высокий GPA и участие в научных проектах института.",
        aiRelevance: "Medium",
      },
    ],
    programs: [
      {
        id: "sat-bsc-se",
        name: "BSc in Software Engineering",
        facultyId: "sat-ict",
        annualTuitionKzt: 4_800_000,
        field: "Engineering",
        degree: "Bachelor",
        durationYears: 4,
        language: "English",
        fitScore: 85,
        matchReason: "Полный цикл разработки ПО и командные проекты с индустрией.",
        detailedDescription: ["Алгоритмы, архитектура, DevOps-введение.", "Стажировки у партнёров."],
        entryRequirements: ["Математика и информатика", "IELTS 6.0+ для EN-потока", "Конкурсный балл"],
      },
      {
        id: "sat-bsc-oil",
        name: "BSc in Oil and Gas Engineering",
        facultyId: "sat-oil",
        annualTuitionKzt: 4_200_000,
        field: "Engineering",
        degree: "Bachelor",
        durationYears: 4,
        language: "Russian / Kazakh",
        fitScore: 80,
        matchReason: "Инженерия для нефтегазового сектора Казахстана.",
        detailedDescription: ["Технология добычи, оборудование, экология производства."],
        entryRequirements: ["Физика и математика", "ЕНТ"],
      },
    ],
  },
  {
    id: "abaikaznpu",
    name: "Abai Kazakh National Pedagogical University",
    city: "Almaty, Kazakhstan",
    foundedYear: 1928,
    type: "Comprehensive",
    languagesOfInstruction: ["Kazakh", "Russian", "English"],
    applicationDeadline: "2026-08-10",
    scholarshipBlurb:
      "Государственные гранты на педагогические специальности, социальные категории и поддержка сельской молодёжи (по квотам года).",
    heroImageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=72",
    tuitionOverview: {
      minKzt: 900_000,
      maxKzt: 2_100_000,
      note: "Педагогические программы часто имеют грантовые места; контракт — разумный для региональных абитуриентов.",
    },
    faculties: [
      {
        id: "abai-ped-primary",
        name: "Faculty of Preschool and Primary Education",
        description:
          "Методика начального обучения, детская психология и игровые технологии; практики в школах и детсадах.",
      },
      {
        id: "abai-ped-natural",
        name: "Faculty of Natural Science Education",
        description:
          "Подготовка учителей математики, физики, информатики и естественных дисциплин с лабораторным блоком.",
      },
      {
        id: "abai-ped-humanities",
        name: "Faculty of Humanities Education",
        description:
          "Учителя литературы, истории, языков и общественных дисциплин; проектное обучение и читальные клубы.",
      },
      {
        id: "abai-foreign",
        name: "Faculty of Foreign Languages",
        description:
          "Лингвистика, перевод, методика преподавания английского и вторых языков; международные сертификаты.",
      },
      {
        id: "abai-psych",
        name: "Faculty of Psychology and Social Work",
        description:
          "Клиническая и образовательная психология, консультирование и социальная работа в школе и сообществе.",
      },
      {
        id: "abai-arts",
        name: "Faculty of Arts and Culture",
        description:
          "Музыкальное и художественное образование, хореография и режиссура школьных постановок.",
      },
      {
        id: "abai-sport-ped",
        name: "Faculty of Physical Culture and Sport Pedagogy",
        description:
          "Учителя физкультуры, тренеры молодёжных секций и организаторы массового спорта.",
      },
      {
        id: "abai-math",
        name: "Faculty of Mathematics and Informatics Education",
        description:
          "Глубокая математическая подготовка будущих учителей и олимпиадное наставничество.",
      },
      {
        id: "abai-defectology",
        name: "Faculty of Special and Inclusive Education",
        description:
          "Дефектология, логопедия и инклюзивные практики для работы с особыми образовательными потребностями.",
      },
      {
        id: "abai-management-edu",
        name: "Faculty of Educational Management and Leadership",
        description:
          "Управление школой, образовательная политика и цифровая трансформация учебных заведений.",
      },
      {
        id: "abai-kazakh-lang",
        name: "Faculty of Kazakh Language and Literature",
        description:
          "Филология, диалектология и современная литература; подготовка филологов и редакторов.",
      },
      {
        id: "abai-preschool-master",
        name: "Institute of Additional Education and Professional Retraining",
        description:
          "Курсы повышения квалификации учителей, магистратуры ускоренного формата и методическая поддержка регионов.",
      },
    ],
    admissionExpectations: {
      gpaScaleMax: 5.0,
      strongGpa: 4.1,
      competitiveGpa: 3.55,
      competitiveSat: 1050,
      targetSat: 1220,
      competitiveUnt: 85,
      targetUnt: 105,
      minIelts: 5.0,
      modelNote:
        "Педагогический вуз: конкурс на учительские специальности зависит от квот и сельских программ; IELTS часто для языковых потоков.",
    },
    scholarships: [
      {
        name: "Грант на педагогические специальности",
        requirements: "Конкурс ЕНТ и целевые направления по перечню Минпросвещения.",
        aiRelevance: "High",
      },
    ],
    programs: [
      {
        id: "abai-bsc-primary-ed",
        name: "BSc in Primary Education",
        facultyId: "abai-ped-primary",
        annualTuitionKzt: 1_250_000,
        field: "Humanities",
        degree: "Bachelor",
        durationYears: 4,
        language: "Kazakh / Russian",
        fitScore: 70,
        matchReason: "Подготовка учителя начальных классов и воспитателя.",
        detailedDescription: ["Методики обучения чтению и счёту.", "Практика в партнёрских школах."],
        entryRequirements: ["ЕНТ", "Мотивационное интервью по году"],
      },
      {
        id: "abai-bsc-english-ed",
        name: "BSc in English Language Education",
        facultyId: "abai-foreign",
        annualTuitionKzt: 1_450_000,
        field: "Humanities",
        degree: "Bachelor",
        durationYears: 4,
        language: "English / Kazakh / Russian",
        fitScore: 73,
        matchReason: "Учитель английского для школ и языковых центров.",
        detailedDescription: ["Лингвистика и методика.", "IELTS для продвинутых групп."],
        entryRequirements: ["Английский язык в ЕНТ приветствуется", "Устное тестирование"],
      },
    ],
  },
  {
    id: "kaznaru",
    name: "Kazakh National Agrarian Research University",
    city: "Almaty, Kazakhstan",
    foundedYear: 1929,
    type: "Comprehensive",
    languagesOfInstruction: ["Kazakh", "Russian", "English"],
    applicationDeadline: "2026-08-05",
    scholarshipBlurb:
      "Гранты на аграрные и биотехспециальности, поддержка сельской молодёжи и проекты агропредпринимательства.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1800&q=72",
    tuitionOverview: {
      minKzt: 950_000,
      maxKzt: 2_400_000,
      note: "Аграрные программы часто доступнее по контракту; точная сумма зависит от факультета и языка.",
    },
    faculties: [
      {
        id: "nar-agronomy",
        name: "Faculty of Agronomy and Soil Science",
        description:
          "Растениеводство, защита растений, почвоведение и агроэкология; опытные поля и лаборатории анализа.",
      },
      {
        id: "nar-vet",
        name: "Faculty of Veterinary Medicine and Animal Science",
        description:
          "Ветеринария, зоотехния, кормление и биобезопасность животноводческих комплексов.",
      },
      {
        id: "nar-food",
        name: "Faculty of Food Production Technology",
        description:
          "Технология переработки молока, мяса, зерна и масложировой продукции; стандарты качества и безопасности.",
      },
      {
        id: "nar-env",
        name: "Faculty of Environmental Sciences and Water Resources",
        description:
          "Экология сельской местности, гидрология, устойчивое управление водными ресурсами.",
      },
      {
        id: "nar-mechanization",
        name: "Faculty of Agricultural Mechanization and Electrical Engineering",
        description:
          "Тракторы и сельхозмашины, точное земледелие, автоматизация агропроизводства.",
      },
      {
        id: "nar-econ-rural",
        name: "Faculty of Agricultural Economics and Rural Development",
        description:
          "Экономика АПК, кооперация фермеров, маркетинг продукции и государственные программы поддержки.",
      },
      {
        id: "nar-land-mgmt",
        name: "Faculty of Land Management and Cadastre",
        description:
          "Землеустройство, геодезия, кадастр и правовое регулирование земельных отношений.",
      },
      {
        id: "nar-biotech",
        name: "Faculty of Biotechnology and Bioengineering",
        description:
          "Биотехнологии микроорганизмов, селекция и биостимуляторы для растениеводства.",
      },
      {
        id: "nar-forestry",
        name: "Faculty of Forestry and Wildlife",
        description:
          "Лесоведение, охота и сохранение биоразнообразия; лесные питомники и мониторинг экосистем.",
      },
      {
        id: "nar-horticulture",
        name: "Faculty of Horticulture and Crop Sciences",
        description:
          "Овощеводство, садоводство, тепличные технологии и сортовые коллекции.",
      },
      {
        id: "nar-it-agri",
        name: "Faculty of Digital Agriculture and GIS",
        description:
          "ГИС в АПК, дроны и спутниковый мониторинг полей, данные для точного земледелия.",
      },
      {
        id: "nar-law-rural",
        name: "Faculty of Agrarian Law",
        description:
          "Правовое сопровождение фермерских хозяйств, земельные споры и контракты в АПК.",
      },
    ],
    admissionExpectations: {
      gpaScaleMax: 5.0,
      strongGpa: 4.0,
      competitiveGpa: 3.45,
      competitiveSat: 1020,
      targetSat: 1180,
      competitiveUnt: 82,
      targetUnt: 100,
      minIelts: 5.0,
      modelNote:
        "Аграрный профиль: биология и химия важны для многих программ; английский для международных треков.",
    },
    scholarships: [
      {
        name: "Грант на специальности АПК",
        requirements: "Конкурс ЕНТ и целевые программы развития села.",
        aiRelevance: "High",
      },
    ],
    programs: [
      {
        id: "nar-bsc-agronomy",
        name: "BSc in Agronomy",
        facultyId: "nar-agronomy",
        annualTuitionKzt: 1_650_000,
        field: "Science",
        degree: "Bachelor",
        durationYears: 4,
        language: "Kazakh / Russian",
        fitScore: 71,
        matchReason: "Классическое растениеводство и защита урожая для карьеры в АПК.",
        detailedDescription: ["Агрохимия, семеноводство, полевые практики."],
        entryRequirements: ["Биология и химия", "ЕНТ"],
      },
      {
        id: "nar-bsc-food-tech",
        name: "BSc in Food Technology",
        facultyId: "nar-food",
        annualTuitionKzt: 1_800_000,
        field: "Science",
        degree: "Bachelor",
        durationYears: 4,
        language: "Russian / Kazakh",
        fitScore: 72,
        matchReason: "Переработка сельхозсырья и контроль качества продукции.",
        detailedDescription: ["Технологические линии, микробиология пищи."],
        entryRequirements: ["Химия и биология", "ЕНТ"],
      },
    ],
  },
  {
    id: "nkzu",
    name: "M. Kozybayev North Kazakhstan University",
    city: "Petropavl, Kazakhstan",
    foundedYear: 1937,
    type: "Comprehensive",
    languagesOfInstruction: ["Kazakh", "Russian", "English"],
    applicationDeadline: "2026-08-01",
    scholarshipBlurb:
      "Государственные гранты, поддержка студентов из сельской местности и региональные программы развития кадров.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1498243691581-b2c99f900906?auto=format&fit=crop&w=1800&q=72",
    tuitionOverview: {
      minKzt: 850_000,
      maxKzt: 2_000_000,
      note: "Региональный вуз с доступным контрактом; грантовые места по конкурсу ЕНТ.",
    },
    faculties: [
      {
        id: "nkzu-engineering",
        name: "Faculty of Engineering and Technology",
        description:
          "Машиностроение, энергетика и материалы для региональной промышленности и транспорта.",
      },
      {
        id: "nkzu-it",
        name: "Faculty of Information Technologies and Cybersecurity Basics",
        description:
          "Информатика, программирование и основы информационной безопасности для малых предприятий и госуслуг.",
      },
      {
        id: "nkzu-agro",
        name: "Faculty of Agricultural Sciences",
        description:
          "Растениеводство и животноводство для северных зон, кормопроизводство и агроэкология.",
      },
      {
        id: "nkzu-econ-law",
        name: "Faculty of Economics and Law",
        description:
          "Экономика предприятия, финансы, гражданское и предпринимательское право для регионального бизнеса.",
      },
      {
        id: "nkzu-ped",
        name: "Faculty of Pedagogy and Psychology",
        description:
          "Подготовка учителей для школ Северного Казахстана; школьная психология и методики.",
      },
      {
        id: "nkzu-philology",
        name: "Faculty of Philology and Translation",
        description:
          "Казахская и русская филология, иностранные языки и литературное образование.",
      },
      {
        id: "nkzu-history",
        name: "Faculty of History and Cultural Heritage",
        description:
          "История Казахстана и краеведение, музейное дело и туристические маршруты региона.",
      },
      {
        id: "nkzu-natural",
        name: "Faculty of Natural Sciences",
        description:
          "Биология, химия, география и экология северных экосистем.",
      },
      {
        id: "nkzu-math",
        name: "Faculty of Mathematics and Digital Sciences",
        description:
          "Математика, статистика и прикладная информатика для школ и локальной аналитики.",
      },
      {
        id: "nkzu-med-bio",
        name: "Faculty of Biology and Biomedical Foundations",
        description:
          "Биология человека, основы медицинских знаний и подготовка к смежным магистратурам здравоохранения.",
      },
      {
        id: "nkzu-physical",
        name: "Faculty of Physical Culture and Sport",
        description:
          "Физическая рекреация, спортивная подготовка и управление спортивными объектами города.",
      },
      {
        id: "nkzu-international",
        name: "Faculty of International Relations and Regional Studies",
        description:
          "Международные связи Северного региона, соседние рынки и культурная дипломатия.",
      },
    ],
    admissionExpectations: {
      gpaScaleMax: 5.0,
      strongGpa: 4.0,
      competitiveGpa: 3.45,
      competitiveSat: 1000,
      targetSat: 1160,
      competitiveUnt: 78,
      targetUnt: 98,
      minIelts: 5.0,
      modelNote:
        "Региональный комплексный университет; пороги конкурса часто ниже столичных — подходит для широкого пула абитуриентов.",
    },
    scholarships: [
      {
        name: "Государственный образовательный грант",
        requirements: "Конкурс ЕНТ для граждан РК.",
        aiRelevance: "High",
      },
      {
        name: "Социальная поддержка сельской молодёжи",
        requirements: "Документы о регистрации в сельской местности при наличии квот.",
        aiRelevance: "Medium",
      },
    ],
    programs: [
      {
        id: "nkzu-bsc-cs",
        name: "BSc in Computer Science",
        facultyId: "nkzu-it",
        annualTuitionKzt: 1_950_000,
        field: "Engineering",
        degree: "Bachelor",
        durationYears: 4,
        language: "Russian / Kazakh",
        fitScore: 75,
        matchReason: "Прикладная информатика для регионального рынка труда.",
        detailedDescription: ["Программирование, базы данных, веб."],
        entryRequirements: ["Математика", "ЕНТ"],
      },
      {
        id: "nkzu-bba-econ",
        name: "BBA in Economics",
        facultyId: "nkzu-econ-law",
        annualTuitionKzt: 1_450_000,
        field: "Business",
        degree: "Bachelor",
        durationYears: 4,
        language: "Kazakh / Russian",
        fitScore: 70,
        matchReason: "Экономика и управление для малого бизнеса региона.",
        detailedDescription: ["Микроэкономика, учёт, маркетинг."],
        entryRequirements: ["Математика и обществознание", "ЕНТ"],
      },
    ],
  },
];
