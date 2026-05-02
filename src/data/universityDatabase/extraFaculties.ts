import type { UniversityFaculty } from "../../mockData";

/**
 * Дополнительные факультеты / школы / институты из открытых структур вузов (официальные сайты, разделы «Структура»).
 * Источники сведений обобщены для демо QApp — перед подачей уточняйте актуальный учебный план на сайте вуза.
 */
export const EXTRA_FACULTIES_BY_UNIVERSITY_ID: Record<string, UniversityFaculty[]> = {
  nu: [
    {
      id: "nu-gsb",
      name: "Graduate School of Business",
      description:
        "MBA и узкоспециализированные магистратуры для управленцев: стратегия, финансы, операционная эффективность и лидерство; кейсы с региональным и международным бизнесом.",
    },
    {
      id: "nu-gse",
      name: "Graduate School of Education",
      description:
        "Подготовка исследователей и практиков в образовании: EdTech, политика школ, оценивание и развитие преподавателей в англоязычной академической среде.",
    },
    {
      id: "nu-gspp",
      name: "Graduate School of Public Policy",
      description:
        "Аналитика государственной политики, экономика регионов, программы развития и управление проектами в публичном секторе; междисциплинарные семинары и полевые исследования.",
    },
    {
      id: "nu-med",
      name: "School of Medicine",
      description:
        "Медицинское образование по международным стандартам: базовые науки, клинические навыки, этика и исследования; партнёрские практики в системе здравоохранения.",
    },
    {
      id: "nu-mng",
      name: "School of Mining and Geosciences",
      description:
        "Геология, геофизика, недропользование и устойчивое освоение ресурсов: полевые практики, лаборатории и связь с отраслевыми стандартами.",
    },
    {
      id: "nu-nla",
      name: "NU Laboratory Schools Network (образовательная экосистема)",
      description:
        "Связка кампуса с лабораторными школами и проектами STEM/outreach — как контекст для педагогических и социальных исследований (описательно для каталога QApp).",
    },
  ],
  kbtu: [
    {
      id: "kbtu-arch-civil",
      name: "Faculty of Architecture and Civil Engineering",
      description:
        "Архитектурное проектирование, инженерия конструкций и городская среда: BIM, устойчивые материалы и нормативная база строительства РК.",
    },
    {
      id: "kbtu-chem-eng",
      name: "Faculty of Chemical Engineering and Ecology",
      description:
        "Химическая технология, переработка, экологический мониторинг и безопасность производств; лаборатории для прототипирования процессов.",
    },
    {
      id: "kbtu-geology",
      name: "Faculty of Geology and Exploration",
      description:
        "Поиск и оценка месторождений, геологическое картирование, горное дело и связка с нефтегазовым блоком KBTU.",
    },
    {
      id: "kbtu-transport",
      name: "Faculty of Transport and Mechanical Engineering",
      description:
        "Транспортные системы, машиностроение и надёжность оборудования; проектное обучение с производственными стажировками.",
    },
    {
      id: "kbtu-econ-intl",
      name: "International School of Economics",
      description:
        "Экономическая теория, эконометрика и прикладная аналитика с акцентом на международную торговлю и финансовые рынки.",
    },
    {
      id: "kbtu-pharma-food",
      name: "Faculty of Food Technology and Biotechnology",
      description:
        "Технология продуктов питания, качество и безопасность пищевых цепочек; биотехнологические процессы для переработки сырья.",
    },
  ],
  aitu: [
    {
      id: "aitu-cyber",
      name: "Institute of Information Security and Cyber Defense",
      description:
        "Кибербезопасность сетей и приложений, анализ угроз, криптография и практики SOC — стажировки и хакатоны по защите инфраструктуры.",
    },
    {
      id: "aitu-iot",
      name: "Institute of Smart Systems and IoT",
      description:
        "Встраиваемые системы, датчики, промышленный IoT и edge-вычисления; прототипирование умных кампусных и городских решений.",
    },
    {
      id: "aitu-govtech",
      name: "Faculty of Digital Economy and Public Sector Innovation",
      description:
        "Цифровизация услуг, данные государственных реестров и этика автоматизации — кейсы для smart-city и e-government.",
    },
    {
      id: "aitu-design-digital",
      name: "School of Digital Arts and Interaction Design",
      description:
        "UX/UI, медиа-дизайн и продуктовый дизайн для IT-сервисов; связка с разработкой через agile-команды учебных студий.",
    },
    {
      id: "aitu-resilience",
      name: "Center for IT Infrastructure Resilience (учебный блок)",
      description:
        "Облака, отказоустойчивость, DevOps-практики и эксплуатация больших систем — как дополнительный трек для инженеров платформы.",
    },
  ],
  kaznu: [
    {
      id: "kaznu-history",
      name: "Faculty of History, Archaeology and Ethnology",
      description:
        "История Казахстана и мира, археология степных памятников и этнография; экспедиции, музейная практика и работа с источниками.",
    },
    {
      id: "kaznu-oriental",
      name: "Faculty of Oriental Studies",
      description:
        "Языки и культуры Востока, региональная политика и межкультурная коммуникация; подготовка переводчиков и аналитиков.",
    },
    {
      id: "kaznu-international",
      name: "Faculty of International Relations",
      description:
        "Международное право и организации, дипломатия, глобальная безопасность и межкультурные переговоры; модели ООН и дебаты.",
    },
    {
      id: "kaznu-geography",
      name: "Faculty of Geography and Environmental Sciences",
      description:
        "Физическая география, геоинформатика, климат и устойчивое развитие территорий; полевые школы и картографические проекты.",
    },
    {
      id: "kaznu-physics-tech",
      name: "Faculty of Physics and Technology",
      description:
        "Экспериментальная физика, электроника, оптоэлектроника и материалы; лаборатории для исследований и инженерных приложений.",
    },
    {
      id: "kaznu-philosophy",
      name: "Faculty of Philosophy and Political Science",
      description:
        "Социально-политическая теория, этика технологий и критическое мышление; академические дискуссии и исследовательские семинары.",
    },
    {
      id: "kaznu-medicine",
      name: "Medical Faculty (General Medicine track)",
      description:
        "Фундаментальные медицинские дисциплины и клинические базы (по контракту года набора); интеграция с университетской клиникой — уточняйте на сайте КазНУ.",
    },
  ],
  sdu: [
    {
      id: "sdu-edu-hum",
      name: "Faculty of Education and Humanities",
      description:
        "Педагогика, психология, языки и социальная работа; практики в школах и инклюзивные программы подготовки учителей.",
    },
    {
      id: "sdu-it-bus",
      name: "Faculty of Digital Management and Innovation",
      description:
        "Цифровая трансформация бизнеса, продуктовый менеджмент и аналитика данных для малого и среднего предпринимательства.",
    },
    {
      id: "sdu-pharm",
      name: "Faculty of Pharmacy and Pharmaceutical Sciences",
      description:
        "Фармацевтическая химия, клиническая фармация и управление качеством лекарственных средств; лаборатории анализа.",
    },
    {
      id: "sdu-lang",
      name: "Faculty of Foreign Languages and Translation",
      description:
        "Профессиональный перевод, терминология и межкультурная коммуникация для бизнеса и государственных проектов.",
    },
    {
      id: "sdu-sport",
      name: "Faculty of Physical Culture and Sports Management",
      description:
        "Тренерская подготовка, спортивная медицина основ и управление спортивными объектами; партнёрства с федерациями.",
    },
  ],
};
