export interface TemplatePosition {
  x: number;
  y: number;
  size: number;
  color: string;
  align: "left" | "center" | "right";
  font: string;
}

export interface TemplateConfig {
  templatePath: string;
  name: string;
  defaultPositions: {
    title: TemplatePosition;
    description: TemplatePosition;
    date: TemplatePosition;
    number: TemplatePosition;
    expired: TemplatePosition;
  };
  
  
  
}

// Konfigurasi template dengan default positions
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "certificate/kunjungan_industri/industri1.png": {
    templatePath: "certificate/kunjungan_industri/industri1.png",
    name: "Industrial Visit Template 1",
    defaultPositions: {
      title: { 
        x: 985,
        y: 621, 
        size: 30, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 973,
        y: 780, 
        size: 13, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 541, 
        y: 1112, 
        size: 11, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      number: {
        x: 1735,
        y: 73,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1391,
        y: 1099,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/kunjungan_industri/industri2.png": {
    templatePath: "certificate/kunjungan_industri/industri2.png",
    name: "Industrial Visit Template 2",
    defaultPositions: {
      title: { 
        x: 683,
        y: 847, 
        size: 29, 
        color: "#259e8f", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 682, 
        y: 972, 
        size: 16, 
        color: "#333333", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 413, 
        y: 1620, 
        size: 15, 
        color: "#666666", 
        align: "right", 
        font: "Arial, Helvetica, sans-serif" 
      },
      number: {
        x: 1194,
        y: 212,
        size: 16,
        color: "#333333",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1034,
        y: 1656,
        size: 15,
        color: "#333333",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/magang/magang1.png": {
    templatePath: "certificate/magang/magang1.png",
    name: "Internship Template 1",
    defaultPositions: {
      title: { 
        x: 967, 
        y: 679, 
        size: 30, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 999, 
        y: 852, 
        size: 14, 
        color: "#000000", 
        align: "center", 
        font: "Arial, Helvetica, sans-serif" 
      },
      date: { 
        x: 241, 
        y: 1243, 
        size: 13, 
        color: "#000000", 
        align: "left", 
        font: "Arial, Helvetica, sans-serif" 
      },
      number: {
        x: 1685,
        y: 140,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1531,
        y: 1254,
        size: 13,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/magang/magang2.png": {
    templatePath: "certificate/magang/magang2.png",
    name: "Internship Template 2",
    defaultPositions: {
      title: { 
        x: 700, 
        y: 936, 
        size: 35, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 728, 
        y: 1338, 
        size: 15, 
        color: "#000000", 
        align: "center", 
        font: "Arial, Helvetica, sans-serif" 
      },
      date: { 
        x: 161, 
        y: 1694, 
        size: 13, 
        color: "#000000", 
        align: "left", 
        font: "Arial, Helvetica, sans-serif" 
      },
      number: {
        x: 708,
        y: 394,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1101,
        y: 1695,
        size: 13,
        color: "#000000",
        align: "center",
        font: "Arial, Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/mou/mou1.png": {
    templatePath: "certificate/mou/mou1.png",
    name: "MoU Template 1",
    defaultPositions: {
      title: { 
        x: 777, 
        y: 451, 
        size: 34, 
        color: "#000000", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 289, 
        y: 645, 
        size: 15, 
        color: "#000000", 
        align: "left", 
        font: "Times New Roman, Times, serif" 
      },
      date: { 
        x: 428, 
        y: 966, 
        size: 14, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      number: {
        x: 360,
        y: 82,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1650,
        y: 1279,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/mou/mou2.png": {
    templatePath: "certificate/mou/mou2.png",
    name: "MoU Template 2",
    defaultPositions: {
      title: { 
        x: 489, 
        y: 789, 
        size: 34, 
        color: "#000000", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 148, 
        y: 984, 
        size: 17, 
        color: "#000000", 
        align: "left", 
        font: "Times New Roman, Times, serif" 
      },
      date: { 
        x: 283, 
        y: 1754, 
        size: 14, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      number: {
        x: 213,
        y: 543,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1053,
        y: 1833,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/pelatihan/pelatihan1.png": {
    templatePath: "certificate/pelatihan/pelatihan1.png",
    name: "Training Template 1",
    defaultPositions: {
      title: { 
        x: 956, 
        y: 568, 
        size: 31, 
        color: "#26786e", 
        align: "center", 
        font: "Inter, Arial, ui-sans-serif, system-ui" 
      },
      description: { 
        x: 969, 
        y: 750, 
        size: 15, 
        color: "#26786e", 
        align: "center", 
        font: "Inter, Arial, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 501, 
        y: 1213, 
        size: 13, 
        color: "#26786e", 
        align: "center", 
        font: "Inter, Arial, ui-sans-serif, system-ui" 
      },
      number: {
        x: 975,
        y: 267,
        size: 14,
        color: "#26786e",
        align: "center",
        font: "Inter, Arial, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1471,
        y: 1216,
        size: 1,
        color: "#26786e",
        align: "center",
        font: "Inter, Arial, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/pelatihan/pelatihan2.png": {
    templatePath: "certificate/pelatihan/pelatihan2.png",
    name: "Training Template 2",
    defaultPositions: {
      title: { 
        x: 700,
        y: 1077, 
        size: 38, 
        color: "#c9ac17", 
        align: "center", 
        font: "Inter, Times New Roman, ui-sans-serif, system-ui" 
      },
      description: { 
        x: 712, 
        y: 1282, 
        size: 15, 
        color: "#868dad", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 333,
        y: 1687, 
        size: 13, 
        color: "#868dad", 
        align: "center", 
        font: "Inter, Arial, ui-sans-serif, system-ui" 
      },
      number: {
        x: 1154,
        y: 131,
        size: 16,
        color: "#c9ac17",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 330,
        y: 1768,
        size: 13,
        color: "#868dad",
        align: "center",
        font: "Inter, Arial, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/pelatihan/pelatihan3.png": {
    templatePath: "certificate/pelatihan/pelatihan3.png",
    name: "Training Template 2",
    defaultPositions: {
      title: { 
        x: 950,
        y: 448, 
        size: 8, 
        color: "#000", 
        align: "center", 
        font: "Inter, Times New Roman, ui-sans-serif, system-ui" 
      },
      description: { 
        x: 889, 
        y: 584, 
        size: 8, 
        color: "#000", 
        align: "left", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 1568,
        y: 727, 
        size: 7, 
        color: "#000", 
        align: "center", 
        font: "Inter, Arial, ui-sans-serif, system-ui" 
      },
      number: {
        x: 1010,
        y: 321,
        size: 9,
        color: "#000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 231,
        y: 1125,
        size: 7,
        color: "#000",
        align: "center",
        font: "Inter, Arial, ui-sans-serif, system-ui"
      }
    }
  }
};

// Fungsi untuk mendapatkan konfigurasi template berdasarkan path
export function getTemplateConfig(templatePath: string): TemplateConfig | null {
  return TEMPLATE_CONFIGS[templatePath] || null;
}

// Fungsi untuk mendapatkan semua template configs untuk kategori tertentu
export function getTemplateConfigsForCategory(category: string): TemplateConfig[] {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
  return Object.values(TEMPLATE_CONFIGS).filter(config => 
    config.templatePath.includes(categoryKey)
  );
}

// Fungsi untuk mendapatkan default positions
export function getDefaultPositions(templatePath: string) {
  const config = getTemplateConfig(templatePath);
  return config?.defaultPositions || null;
}
