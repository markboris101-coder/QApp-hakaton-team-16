import type { UniversityFaculty } from "../../mockData";

/**
 * Дополнительные факультеты / школы / институты из открытых структур вузов (официальные сайты).
 * NU — nu.edu.kz/academics/schools; KBTU — kbtu.edu.kz/en/schools; КазНУ/SDU/AITU — обобщение по разделам «Schools/Faculties» и без дублирования id с базой mockData.
 * Перед подачей уточняйте актуальный состав подразделений на сайте вуза.
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
    {
      id: "nu-cps",
      name: "Center for Preparatory Studies (NU CPS)",
      description:
        "Подготовительный год и программы Foundation Year с аккредитацией BALEAP; английский для академических целей и мост в бакалавриат NU или зарубежные вузы.",
    },
    {
      id: "nu-cenms",
      name: "Center for Energy and New Materials Science",
      description:
        "Исследования в области энергетики, материаловедения и ИТ для «чистой» энергии; международные партнёрства и прикладные лаборатории кампуса NU.",
    },
    {
      id: "nu-nurce",
      name: "Nazarbayev University Research Centre for Entrepreneurship (NURCE)",
      description:
        "Исследовательский центр предпринимательства при Graduate School of Business: стартапы, инновационная экосистема и политика поддержки МСП.",
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
    {
      id: "kbtu-matsci-green",
      name: "School of Materials Science and Green Technologies",
      description:
        "Материаловедение, устойчивые технологии и «зелёная» химия; лаборатории синтеза и экспериментальные установки по данным открытых страниц KBTU.",
    },
    {
      id: "kbtu-applied-math",
      name: "School of Applied Mathematics",
      description:
        "Прикладная математика, моделирование процессов и вычислительные методы для инженерных и экономических задач добывающего региона.",
    },
    {
      id: "kbtu-ite",
      name: "School of Information Technology and Engineering",
      description:
        "Инженерия информационных систем, робототехника и смежные направления — официальная школа KBTU рядом с ИТ-направлениями (по структуре сайта вуза).",
    },
    {
      id: "kbtu-ise",
      name: "International School of Economics and Social Sciences (ISE)",
      description:
        "Партнёрские программы с University of London (LSE track): экономика, финансы, data science и социальные науки в англоязычной среде.",
    },
    {
      id: "kbtu-natural-social",
      name: "School of Natural and Social Sciences",
      description:
        "Естественнонаучная и социогуманитарная подготовка в инженерном контексте; междисциплинарные курсы и исследовательские семинары.",
    },
  ],
  aitu: [
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
    {
      id: "aitu-digital-mining",
      name: "Institute of Digital Mining, Geoinformatics and Subsurface Data",
      description:
        "Геоинформатика, цифровые двойники месторождений и аналитика добывающих данных — трек для казахстанского нефтегазово-горного сектора.",
    },
    {
      id: "aitu-fintech",
      name: "Institute of Financial Technologies, Blockchain and RegTech",
      description:
        "Финтех, распределённые реестры, комплаенс и цифровые платежи; лаборатории с банками и IT-регуляторикой (учебные кейсы).",
    },
    {
      id: "aitu-edtech",
      name: "Institute of Educational Technologies and Learning Analytics",
      description:
        "LMS, адаптивное обучение, аналитика успеваемости и дизайн цифровых курсов; связка с EdTech-стартапами Астаны.",
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
    {
      id: "kaznu-radio-engineering",
      name: "Faculty of Radio Engineering and Electronics",
      description:
        "Радиотехника, микроэлектроника, схемотехника и телеком; НИР и стажировки в отрасли связи (по открытым разделам КазНУ).",
    },
    {
      id: "kaznu-mechanical-engineering",
      name: "Faculty of Mechanics and Technology",
      description:
        "Прикладная механика, машиностроение и технологические процессы; подготовка инженеров для промышленности Алматы и регионов.",
    },
    {
      id: "kaznu-information-systems",
      name: "Faculty of Information Systems and Cybersecurity",
      description:
        "Информационные системы, сети и информационная безопасность на базе классического университета; проектные семестры и хакатоны.",
    },
    {
      id: "kaznu-space-engineering",
      name: "Faculty / Institute Cluster — Aerospace and Space Technologies",
      description:
        "Подготовка и НИР в области космических технологий и инженерии (организационные единицы КазНУ — уточняйте актуальный состав на kaznu.kz).",
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
    {
      id: "sdu-foundation",
      name: "Center for Foundation Studies and Academic English",
      description:
        "Подготовительные программы, академический английский и мост в бакалавриат SDU для международных и внутренних абитуриентов.",
    },
    {
      id: "sdu-research-innovation",
      name: "Research Institute of Innovation and Smart Systems",
      description:
        "Прикладные исследования в робототехнике, умном кампусе и устойчивой инфраструктуре; гранты и проекты с индустрией.",
    },
    {
      id: "sdu-intl-programs",
      name: "Office of International Programs and Academic Mobility",
      description:
        "Двойные дипломы, обмены Erasmus+ и партнёрские сети; координация англоязычных треков и летних школ.",
    },
  ],
};
