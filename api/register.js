export default async function handler(request, response) {
  // מאפשר לאתר שלך לשלוח מידע בצורה בטוחה
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'POST') {
    const { name, email } = request.body;

    if (!name || !email) {
      return response.status(400).json({ error: 'שם ואימייל הם שדות חובה' });
    }

    try {
      // שליחת הנתונים ל-Vercel KV שפתחת באמצעות ה-URL שקיבלת
      const kvUrl = process.env.KV_REST_API_URL;
      const kvToken = process.env.KV_REST_API_TOKEN;

      // אנחנו שומרים את המשתמש תחת מפתח ייחודי המבוסס על הזמן הנוכחי
      const userId = `user_${Date.now()}`;
      
      const kvResponse = await fetch(`${kvUrl}/set/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, registeredAt: new Date().toISOString() })
      });

      if (!kvResponse.ok) throw new Error('שגיאה בשמירה ל-KV');

      return response.status(200).json({ success: true, message: 'הנרשם נשמר בהצלחה!' });
    } catch (error) {
      return response.status(500).json({ error: 'שגיאה בשרת: ' + error.message });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
