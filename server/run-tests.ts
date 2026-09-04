process.env.NODE_ENV = 'test';
process.env.PORT = '5002';

import http from 'http';
import { app } from './src/index';
import prisma from './src/prisma';

const TEST_PORT = 5002;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

async function main() {
  console.log('🚀 Starting In-Process Test Runner on port', TEST_PORT);

  const testServer = http.createServer(app);

  testServer.listen(TEST_PORT, '127.0.0.1', async () => {
    try {
      console.log('====================================================');
      console.log('🧪 RUNNING FULL-STACK BACKEND VERIFICATION SUITE');
      console.log('====================================================\n');

      // 1. Health Check
      console.log('1️⃣ [GET /api/health] Testing API Health Endpoint');
      const healthRes = await fetch(`${BASE_URL}/health`);
      const healthData = (await healthRes.json()) as any;
      console.log('   Status:', healthRes.status, '| Service:', healthData.service);
      if (!healthRes.ok) throw new Error('Health check failed');

      // 2. Register New User
      console.log('\n2️⃣ [POST /api/auth/register] Testing User Registration');
      const uniqueEmail = `test_${Date.now()}@taskflow.dev`;
      const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Verification Bot',
          email: uniqueEmail,
          password: 'password123',
          role: 'MEMBER'
        })
      });
      const registerData = (await registerRes.json()) as any;
      console.log('   Status:', registerRes.status, '| Registered User:', registerData.user?.email);
      if (registerRes.status !== 201 || !registerData.token) throw new Error('Registration failed');

      // 3. Login Demo Admin User
      console.log('\n3️⃣ [POST /api/auth/login] Testing Admin Login (alex@taskflow.dev)');
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex@taskflow.dev',
          password: 'password123'
        })
      });
      const loginData = (await loginRes.json()) as any;
      console.log('   Status:', loginRes.status, '| Authenticated As:', loginData.user?.name, `(Role: ${loginData.user?.role})`);
      if (loginRes.status !== 200 || !loginData.token) throw new Error('Login failed');
      const adminToken = loginData.token;

      // 4. Fetch User Directory (Protected)
      console.log('\n4️⃣ [GET /api/users] Testing User Directory (Task Assignees)');
      const usersRes = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const usersData = (await usersRes.json()) as any;
      console.log('   Status:', usersRes.status, '| Total team members found:', usersData.users?.length);
      if (!usersRes.ok || !Array.isArray(usersData.users)) throw new Error('User directory retrieval failed');

      // 5. Get Task Stats
      console.log('\n5️⃣ [GET /api/tasks/stats] Testing Dashboard Statistics Calculation');
      const statsRes = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const statsData = (await statsRes.json()) as any;
      console.log('   Status:', statsRes.status, '| Stats Summary:', JSON.stringify(statsData.stats));
      if (!statsRes.ok) throw new Error('Stats calculation failed');

      // 6. Create Task
      console.log('\n6️⃣ [POST /api/tasks] Testing Task Creation (CRUD: Create)');
      const assigneeId = usersData.users[0]?.id || null;
      const createRes = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          title: 'Automated Test Task Suite Verification',
          description: 'Validating end-to-end task workflow and real-time triggers',
          status: 'TODO',
          priority: 'URGENT',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          assigneeId
        })
      });
      const createData = (await createRes.json()) as any;
      console.log('   Status:', createRes.status, '| Created Task:', `"${createData.task?.title}"`, `[ID: ${createData.task?.id}]`);
      if (createRes.status !== 201 || !createData.task?.id) throw new Error('Task creation failed');
      const createdTaskId = createData.task.id;

      // 7. Get Tasks with Filters (Search & Priority)
      console.log('\n7️⃣ [GET /api/tasks] Testing Filtering & Search (CRUD: Read)');
      const filterRes = await fetch(`${BASE_URL}/tasks?search=Automated&priority=URGENT`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const filterData = (await filterRes.json()) as any;
      console.log('   Status:', filterRes.status, '| Filtered matches found:', filterData.tasks?.length);
      if (!filterRes.ok || filterData.tasks.length === 0) throw new Error('Task filtering failed');

      // 8. Update Task (CRUD: Update)
      console.log('\n8️⃣ [PUT /api/tasks/:id] Testing Task Update (Status transition to IN_PROGRESS)');
      const updateRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          priority: 'HIGH'
        })
      });
      const updateData = (await updateRes.json()) as any;
      console.log('   Status:', updateRes.status, '| Updated Status:', updateData.task?.status, '| Priority:', updateData.task?.priority);
      if (!updateRes.ok || updateData.task?.status !== 'IN_PROGRESS') throw new Error('Task update failed');

      // 9. Read Task Details with Activity History
      console.log('\n9️⃣ [GET /api/tasks/:id] Testing Task Details & Activity History');
      const detailRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const detailData = (await detailRes.json()) as any;
      console.log('   Status:', detailRes.status, '| Activities recorded:', detailData.task?.activities?.length);
      if (!detailRes.ok || detailData.task?.activities?.length === 0) throw new Error('Activity logging failed');

      // 10. Delete Task (CRUD: Delete)
      console.log('\n🔟 [DELETE /api/tasks/:id] Testing Task Deletion (CRUD: Delete)');
      const deleteRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const deleteData = (await deleteRes.json()) as any;
      console.log('   Status:', deleteRes.status, '| Deleted confirmation ID:', deleteData.id);
      if (!deleteRes.ok) throw new Error('Task deletion failed');

      // 11. Security Route Guard (401 Unauthorized check)
      console.log('\n1️⃣1️⃣ [Security Test] Testing Protected Route Without Token');
      const unauthRes = await fetch(`${BASE_URL}/tasks`);
      console.log('   Status:', unauthRes.status, '(Expected 401 Unauthorized)');
      if (unauthRes.status !== 401) throw new Error('Security check failed: unauthenticated request was not blocked');

      console.log('\n====================================================');
      console.log('🎉 ALL 11 VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
      console.log('====================================================\n');

      testServer.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    } catch (err) {
      console.error('\n❌ Test failure:', err);
      testServer.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
      });
    }
  });
}

main();
