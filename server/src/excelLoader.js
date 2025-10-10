import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelDir = path.join(__dirname, '../../data/excel');

// 👇 ключевые слова для поиска колонок (более точные)
const COLUMN_MAP = {
  region: ["наименование муниципального района", "район", "муниципальный"],
  position: ["должность", "должн", "предмет", "вакансия"],
  school: ["образовательная организация", "школа", "оо", "учреждение"],
  hours: ["нагрузка", "час", "ставка", "нагрузка (час)"],
  salary: ["зарплата", "зп", "оклад", "оплата"],
  housing: ["жилье", "общежитие", "вид предост. жилья", "предоставление жилья"],
  benefits: ["льготы", "преференции", "имеющиеся льготы в мр"],
  contacts: ["контакт", "телефон", "фио", "контактные телефоны"],
  email: ["email", "почта", "эл.почта", "адрес эл.почты"],
  support: ["поддержка", "меры поддержки", "дополнительные меры"],
  studentEmployment: ["студент", "трудоустройство", "старший курс"],
  duties: ["обязанности", "функции", "обязанности (кратко)"],
  openDate: ["дата", "открытие", "дата открытия вакансии"],
};

// 🔍 функция для поиска колонки по ключевым словам
function findColumnIndex(headers, keywords) {
  if (!headers || !Array.isArray(headers)) return -1;

  const normalizedHeaders = headers.map(h => String(h).toLowerCase().trim());

  for (const keyword of keywords) {
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (normalizedHeaders[i].includes(keyword.toLowerCase())) {
        return i;
      }
    }
  }
  return -1;
}

// 🧩 функция для чтения одного Excel-файла
function parseExcelFile(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const jobs = [];

  if (!workbook.SheetNames.includes("ОО")) {
    console.log(`❌ Лист "ОО" не найден в файле ${path.basename(filePath)}`);
    return jobs;
  }

  const sheet = workbook.Sheets["ОО"];
  const range = XLSX.utils.decode_range(sheet['!ref']);

  // Ищем строку с заголовками
  let headerRowIndex = -1;
  let headers = [];

  for (let row = range.s.r; row <= Math.min(range.e.r, 10); row++) {
    const rowData = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = { r: row, c: col };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = sheet[cellRef];
      rowData.push(cell ? cell.v : "");
    }

    // Проверяем, есть ли в строке ключевые заголовки
    const hasPosition = rowData.some(cell =>
      String(cell).toLowerCase().includes("должность")
    );
    const hasSchool = rowData.some(cell =>
      String(cell).toLowerCase().includes("образовательная организация")
    );

    if (hasPosition && hasSchool) {
      headerRowIndex = row;
      headers = rowData;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.log(`❌ Заголовки не найдены в файле ${path.basename(filePath)}`);
    return jobs;
  }

  // Определяем индексы колонок
  const columnIndexes = {};
  for (const [key, keywords] of Object.entries(COLUMN_MAP)) {
    columnIndexes[key] = findColumnIndex(headers, keywords);
  }

  console.log(`📊 Найдены колонки в ${path.basename(filePath)}:`, {
    region: columnIndexes.region,
    position: columnIndexes.position,
    school: columnIndexes.school,
    hours: columnIndexes.hours,
    salary: columnIndexes.salary
  });

  // Читаем данные
  for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
    const rowData = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = { r: row, c: col };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = sheet[cellRef];
      rowData.push(cell ? cell.v : "");
    }

    // Извлекаем данные по колонкам
    const region = columnIndexes.region >= 0 ? rowData[columnIndexes.region] : "";
    const position = columnIndexes.position >= 0 ? rowData[columnIndexes.position] : "";
    const school = columnIndexes.school >= 0 ? rowData[columnIndexes.school] : "";

    // Пропускаем пустые строки
    if (!position && !school) continue;

    const job = {
      id: `${path.basename(filePath, ".xlsx")}-${row}`,
      region: region || path.basename(filePath, ".xlsx"),
      position: position || "",
      school: school || "",
      hours: columnIndexes.hours >= 0 ? rowData[columnIndexes.hours] : "",
      salary: columnIndexes.salary >= 0 ? rowData[columnIndexes.salary] : "",
      housing: columnIndexes.housing >= 0 ? rowData[columnIndexes.housing] : "",
      benefits: columnIndexes.benefits >= 0 ? rowData[columnIndexes.benefits] : "",
      contacts: columnIndexes.contacts >= 0 ? rowData[columnIndexes.contacts] : "",
      email: columnIndexes.email >= 0 ? rowData[columnIndexes.email] : "",
      support: columnIndexes.support >= 0 ? rowData[columnIndexes.support] : "",
      studentEmployment: columnIndexes.studentEmployment >= 0 ? rowData[columnIndexes.studentEmployment] : "",
      duties: columnIndexes.duties >= 0 ? rowData[columnIndexes.duties] : "",
      openDate: columnIndexes.openDate >= 0 ? rowData[columnIndexes.openDate] : "",
    };

    // Добавляем только если есть хотя бы должность или школа
    if (job.position || job.school) {
      jobs.push(job);
    }
  }

  console.log(`✅ ${path.basename(filePath)} — найдено ${jobs.length} вакансий`);

  // Логируем первую вакансию для проверки
  if (jobs.length > 0) {
    console.log(`📝 Пример вакансии:`, {
      position: jobs[0].position,
      school: jobs[0].school,
      hours: jobs[0].hours,
      salary: jobs[0].salary
    });
  }

  return jobs;
}

// 🚀 основная функция для получения всех вакансий
function getJobs() {
  console.log('🔍 Поиск Excel файлов в:', excelDir);

  if (!fs.existsSync(excelDir)) {
    console.error("❌ Папка с Excel не найдена:", excelDir);
    console.log("📁 Текущая рабочая директория:", process.cwd());
    console.log("📁 Содержимое корневой директории:", fs.readdirSync('.'));

    // Попробуем найти папку data
    const possiblePaths = [
      './data/excel',
      '../data/excel',
      '../../data/excel',
      './server/data/excel'
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        console.log(`✅ Найдена папка по пути: ${possiblePath}`);
        excelDir = possiblePath;
        break;
      }
    }

    if (!fs.existsSync(excelDir)) {
      return [];
    }
  }
  if (!fs.existsSync(excelDir)) {
    console.error("❌ Папка с Excel не найдена:", excelDir);
    return [];
  }

  const files = fs.readdirSync(excelDir).filter(f => f.endsWith(".xlsx"));
  console.log(`📁 Найдено ${files.length} Excel файлов`);

  let allJobs = [];

  files.forEach(file => {
    try {
      const filePath = path.join(excelDir, file);
      const jobs = parseExcelFile(filePath);
      allJobs = allJobs.concat(jobs);
    } catch (err) {
      console.error(`❌ Ошибка чтения ${file}:`, err.message);
    }
  });

  console.log(`🎉 Итого загружено ${allJobs.length} вакансий из ${files.length} файлов`);
  return allJobs;
}

export { getJobs };