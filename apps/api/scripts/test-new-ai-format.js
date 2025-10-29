/**
 * 测试新版AI Prompt和数据解析
 */

const axios = require('axios');

// 配置
const API_KEY =
  process.env.OPENAI_API_KEY || '732372aa-8401-4d91-b9c2-47726252d6ee';
const BASE_URL =
  process.env.OPENAI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const MODEL = process.env.OPENAI_MODEL || 'doubao-seed-1-6-flash-250828';

// 新版Prompt
function buildPrompt(birthday, date) {
  return `你是一位专业的运势分析师，你的任务是结合星盘、运势、玄学知识，根据当日时间和生日为客户生成今日详细运势分析。
今日的日期如下：
<today_date>
${date}
</today_date>
用户的生日如下：
<user_birthday>
${birthday}
</user_birthday>
在进行运势分析时，请遵循以下要求：
1. 综合运用星盘、运势、玄学知识进行全面分析。详细且深入地阐述每个方面的运势情况。
2. 分析内容应包括事业、财富、爱情三方面。
3. 提供的运势分析要详细且具有一定的深度和专业性。
4. 根据分析结果进行总结，提供6项数据：事业运星数、财富运星数、爱情运星数、建议、避免事项、今日宜、今日忌、今日幸运色和幸运数字、综合分数；其中星数满分5星，可打半星如4.5星；今日宜、今日忌、今日幸运色和幸运数字简洁如今日宜"合作"、今日忌"激动"、今日幸运色和幸运数字"黄色、12"；最后结合总体分析结果给出综合分数，满分100分。
5. 语言表达要清晰、易懂，避免使用过于晦涩的术语。
请按以下格式输出你的运势分析：
<fortune_analysis>
星盘分析:
[在此写下星盘分析内容]

事业运分析:
[在此写下事业运分析内容]

财富运分析:
[在此写下财富运分析内容]

爱情运分析:
[在此写下爱情运分析内容]

总结和建议:
事业运星数:[在此写下事业运星数]
财富运星数:[在此写下财富运星数]
爱情运星数:[在此写下爱情运星数]

建议事项:
[在此写下建议事项]
避免事项:
[在此写下避免事项]

今日宜:[简述10字内，写下今日宜做的事]
今日忌:[简述10字内，写下今日忌做的事]
今日幸运色:[在此写下今日幸运色]
今日幸运数字:[在此写下今日幸运数字]
今日运势综合数字:[在此写下今日运势综合分数]

今日简要总结:[在此写下今日简要总结]
</fortune_analysis>`;
}

// 解析AI响应
function parseResponse(content) {
  const result = {
    overallScore: 75,
    careerStars: 3,
    wealthStars: 3,
    loveStars: 3,
  };

  // 提取星盘分析
  const astroMatch = content.match(
    /星盘分析[：:]\s*\n([\s\S]*?)(?=\n\n|事业运分析|$)/,
  );
  if (astroMatch) {
    result.astroAnalysis = astroMatch[1].trim();
  }

  // 提取事业运分析
  const careerAnalysisMatch = content.match(
    /事业运分析[：:]\s*\n([\s\S]*?)(?=\n\n|财富运分析|$)/,
  );
  if (careerAnalysisMatch) {
    result.careerAnalysis = careerAnalysisMatch[1].trim();
  }

  // 提取财富运分析
  const wealthAnalysisMatch = content.match(
    /财富运分析[：:]\s*\n([\s\S]*?)(?=\n\n|爱情运分析|$)/,
  );
  if (wealthAnalysisMatch) {
    result.wealthAnalysis = wealthAnalysisMatch[1].trim();
  }

  // 提取爱情运分析
  const loveAnalysisMatch = content.match(
    /爱情运分析[：:]\s*\n([\s\S]*?)(?=\n\n|总结和建议|$)/,
  );
  if (loveAnalysisMatch) {
    result.loveAnalysis = loveAnalysisMatch[1].trim();
  }

  // 提取星数评分
  const careerStarsMatch = content.match(/事业运星数[：:]\s*([\d.]+)/);
  if (careerStarsMatch) {
    result.careerStars = parseFloat(careerStarsMatch[1]);
  }

  const wealthStarsMatch = content.match(/财富运星数[：:]\s*([\d.]+)/);
  if (wealthStarsMatch) {
    result.wealthStars = parseFloat(wealthStarsMatch[1]);
  }

  const loveStarsMatch = content.match(/爱情运星数[：:]\s*([\d.]+)/);
  if (loveStarsMatch) {
    result.loveStars = parseFloat(loveStarsMatch[1]);
  }

  // 提取建议事项
  const suggestionMatch = content.match(
    /建议事项[：:]\s*\n([\s\S]*?)(?=\n避免事项|$)/,
  );
  if (suggestionMatch) {
    result.suggestion = suggestionMatch[1].trim();
  }

  // 提取避免事项
  const avoidanceMatch = content.match(
    /避免事项[：:]\s*\n([\s\S]*?)(?=\n\n|今日宜|$)/,
  );
  if (avoidanceMatch) {
    result.avoidance = avoidanceMatch[1].trim();
  }

  // 提取今日宜
  const suitableMatch = content.match(/今日宜[：:]\s*([^\n]+)/);
  if (suitableMatch) {
    result.suitable = suitableMatch[1].trim();
  }

  // 提取今日忌
  const unsuitableMatch = content.match(/今日忌[：:]\s*([^\n]+)/);
  if (unsuitableMatch) {
    result.unsuitable = unsuitableMatch[1].trim();
  }

  // 提取幸运色
  const luckyColorMatch = content.match(/今日幸运色[：:]\s*([^\n]+)/);
  if (luckyColorMatch) {
    result.luckyColor = luckyColorMatch[1].trim();
  }

  // 提取幸运数字
  const luckyNumberMatch = content.match(/今日幸运数字[：:]\s*(\d+)/);
  if (luckyNumberMatch) {
    result.luckyNumber = parseInt(luckyNumberMatch[1]);
  }

  // 提取综合分数
  const overallScoreMatch = content.match(/今日运势综合数字[：:]\s*(\d+)/);
  if (overallScoreMatch) {
    result.overallScore = parseInt(overallScoreMatch[1]);
  }

  // 提取今日简要总结
  const summaryMatch = content.match(/今日简要总结[：:]\s*([^\n]+)/);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }

  return result;
}

async function testNewAIFormat() {
  console.log('🚀 测试新版AI Prompt和数据解析\n');

  const birthday = '3月15日';
  const date = new Date().toISOString().split('T')[0];

  console.log(`📅 测试日期: ${date}`);
  console.log(`🎂 测试生日: ${birthday}\n`);

  const prompt = buildPrompt(birthday, date);

  console.log('📝 发送Prompt到AI...\n');

  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        timeout: 30000,
      },
    );

    const duration = Date.now() - startTime;

    console.log(`✅ AI响应成功 (耗时: ${duration}ms)\n`);

    const content = response.data.choices[0].message.content;

    console.log('📄 AI原始响应:');
    console.log('─'.repeat(60));
    console.log(content);
    console.log('─'.repeat(60));
    console.log('');

    console.log('🔍 解析AI响应...\n');

    const parsed = parseResponse(content);

    console.log('✅ 解析结果:');
    console.log('─'.repeat(60));
    console.log(JSON.stringify(parsed, null, 2));
    console.log('─'.repeat(60));
    console.log('');

    console.log('📊 数据验证:');
    console.log(
      `  综合分数: ${parsed.overallScore} ${parsed.overallScore >= 0 && parsed.overallScore <= 100 ? '✅' : '❌'}`,
    );
    console.log(
      `  事业运星数: ${parsed.careerStars} ${parsed.careerStars >= 0 && parsed.careerStars <= 5 ? '✅' : '❌'}`,
    );
    console.log(
      `  财富运星数: ${parsed.wealthStars} ${parsed.wealthStars >= 0 && parsed.wealthStars <= 5 ? '✅' : '❌'}`,
    );
    console.log(
      `  爱情运星数: ${parsed.loveStars} ${parsed.loveStars >= 0 && parsed.loveStars <= 5 ? '✅' : '❌'}`,
    );
    console.log(`  今日简要总结: ${parsed.summary ? '✅' : '❌'}`);
    console.log(`  星盘分析: ${parsed.astroAnalysis ? '✅' : '❌'}`);
    console.log(`  建议事项: ${parsed.suggestion ? '✅' : '❌'}`);
    console.log(`  避免事项: ${parsed.avoidance ? '✅' : '❌'}`);
    console.log(`  今日宜: ${parsed.suitable ? '✅' : '❌'}`);
    console.log(`  今日忌: ${parsed.unsuitable ? '✅' : '❌'}`);
    console.log(`  幸运色: ${parsed.luckyColor ? '✅' : '❌'}`);
    console.log(`  幸运数字: ${parsed.luckyNumber ? '✅' : '❌'}`);

    console.log('\n🎯 测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testNewAIFormat();
