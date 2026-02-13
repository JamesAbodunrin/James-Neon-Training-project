'use client';

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ImageRun,
} from 'docx';
import type { AnalysisResult } from './analysisEngine';

const CHART_IMAGE_WIDTH = 400;
const CHART_IMAGE_HEIGHT = 260;

export async function buildDocxFromResult(
  result: AnalysisResult,
  analysisType: string | null,
  application: string | null,
  projectTitle = 'Thesis Analysis Report',
  options?: { chartImages?: ArrayBuffer[] }
): Promise<Blob> {
  const chartImages = options?.chartImages ?? [];
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      text: projectTitle,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Analysis type: ${analysisType?.replace('-', ' ').toUpperCase() ?? 'N/A'}`, size: 22 }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Application: ${application?.toUpperCase() ?? 'N/A'}`, size: 22 }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString()}`, size: 22 })],
      spacing: { after: 400 },
    })
  );

  children.push(
    new Paragraph({
      text: '1. Method of analysis',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 200 },
    }),
    new Paragraph({
      text: result.methodUsed,
      spacing: { after: 400 },
    })
  );

  if (result.tables.length > 0) {
    children.push(
      new Paragraph({
        text: '2. Data presentation',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );
    let lastSectionNum = 0;
    result.tables.forEach((tbl) => {
      if (tbl.sectionNum !== lastSectionNum) {
        lastSectionNum = tbl.sectionNum;
        children.push(
          new Paragraph({
            children: [new TextRun({ text: tbl.sectionLabel, bold: true, size: 24 })],
            spacing: { before: 280, after: 160 },
          })
        );
      }
      children.push(
        new Paragraph({
          children: [new TextRun({ text: tbl.title, bold: true })],
          spacing: { after: 120 },
        })
      );
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: tbl.headers.map(
              (h) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
                  shading: { fill: 'E8E8E8' },
                })
            ),
          }),
          ...tbl.rows.map(
            (row) =>
              new TableRow({
                children: row.map((cell) =>
                  new TableCell({
                    children: [new Paragraph({ text: String(cell) })],
                  })
                ),
              })
          ),
        ],
      });
      children.push(table);
      if (tbl.interpretation) {
        children.push(
          new Paragraph({
            text: tbl.interpretation,
            spacing: { before: 160, after: 200 },
          })
        );
      } else {
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      }
    });
  }

  if (result.chartData.length > 0) {
    children.push(
      new Paragraph({
        text: '3. Charts and figures',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );
    result.chartData.forEach((series, idx) => {
      const figId = `${idx + 1}`;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Figure ${figId}: ${series.name}`, bold: true })],
          spacing: { before: 200, after: 120 },
        })
      );
      if (chartImages[idx]) {
        try {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: chartImages[idx]!,
                  type: 'png',
                  transformation: { width: CHART_IMAGE_WIDTH, height: CHART_IMAGE_HEIGHT },
                }),
              ],
              spacing: { after: 160 },
            })
          );
        } catch {
          // omit image if invalid
        }
      }
      const table = new Table({
        width: { size: 60, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Category / Measure', bold: true })] })],
                shading: { fill: 'E8E8E8' },
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })] })],
                shading: { fill: 'E8E8E8' },
              }),
            ],
          }),
          ...series.data.map(
            (d) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: d.label })] }),
                  new TableCell({ children: [new Paragraph({ text: String(d.value) })] }),
                ],
              })
          ),
        ],
      });
      children.push(table);
      children.push(new Paragraph({ text: '', spacing: { after: 240 } }));
    });
  }

  if (Object.keys(result.statistics).length > 0) {
    children.push(
      new Paragraph({
        text: '4. Summary statistics',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );
    Object.entries(result.statistics).forEach(([key, value]) => {
      children.push(new Paragraph({ text: `${key}: ${value}`, spacing: { after: 100 } }));
    });
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  if (result.hypothesisTesting.length > 0) {
    children.push(
      new Paragraph({
        text: '5. Hypothesis testing',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );
    result.hypothesisTesting.forEach((ht, i) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${ht.name}`, bold: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: `Null hypothesis: ${ht.nullHypothesis}`, spacing: { after: 80 } }),
        new Paragraph({ text: `Alternative: ${ht.alternativeHypothesis}`, spacing: { after: 80 } }),
        new Paragraph({
          text: `Test statistic: ${ht.testStatistic} = ${ht.statisticValue.toFixed(4)}; p-value = ${ht.pValue.toFixed(4)}; α = ${ht.alpha}`,
          spacing: { after: 80 },
        }),
        new Paragraph({
          text: `Conclusion: ${ht.conclusion === 'reject' ? 'Reject' : 'Fail to reject'} H₀. ${ht.interpretation}`,
          spacing: { after: 200 },
        })
      );
    });
  }

  const interp = result.interpretation_json;
  children.push(
    new Paragraph({
      text: '6. Interpretation',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 200 },
    }),
    new Paragraph({ text: interp.academicParagraph, spacing: { after: 200 } })
  );
  if (interp.significanceStatement) {
    children.push(new Paragraph({ text: interp.significanceStatement, spacing: { after: 200 } }));
  }
  if (interp.effectSizeStatement) {
    children.push(new Paragraph({ text: interp.effectSizeStatement, spacing: { after: 200 } }));
  }
  if (interp.findings.length > 0) {
    interp.findings.forEach((f) => children.push(new Paragraph({ text: `• ${f}`, spacing: { after: 100 } })));
  }
  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  if (result.insights.length > 0) {
    children.push(
      new Paragraph({
        text: '7. Key insights',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );
    result.insights.forEach((s) => children.push(new Paragraph({ text: `• ${s}`, spacing: { after: 100 } })));
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  if (result.recommendations.length > 0) {
    children.push(
      new Paragraph({
        text: '8. Recommendations',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );
    result.recommendations.forEach((r) => children.push(new Paragraph({ text: `• ${r}`, spacing: { after: 100 } })));
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  children.push(
    new Paragraph({
      text: '9. Conclusion (template)',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 200 },
    }),
    new Paragraph({
      text: 'This section should summarize the main findings, state whether the hypotheses were supported, and discuss implications and limitations. Do not include raw data; refer to the tables and figures above.',
      spacing: { after: 200 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
