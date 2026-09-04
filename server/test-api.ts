/**
 * Automated Verification Script for Task Management API
 */

const API_BASE = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status, '| Output:', healthData.service);
    if (!healthRes.ok) throw new Error('Health check failed');

    // 2. Authentication: Login demo admin
    console.log('\n2️⃣ Testing Login with Seed Admin (alex@taskflow.dev)...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex@taskflow.dev',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status, '| User:', loginData.user?.name, `(${loginData.user?.role})`);
    if (!loginRes.ok || !loginData.token) throw new Error('Login failed');
    const token = loginData.token;

    // 3. User Directory
    console.log('\n3️⃣ Testing User Directory (/api/users)...');
    const usersRes = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    console.log('   Status:', usersRes.status, '| Total users found:', usersData.users?.length);
    if (!usersRes.ok) throw new Error('Fetch users failed');

    // 4. Task Stats
    console.log('\n4️⃣ Testing Task Stats (/api/tasks/stats)...');
    const statsRes = await fetch(`${API_BASE}/tasks/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('   Status:', statsRes.status, '| Stats:', JSON.stringify(statsData.stats));
    if (!statsRes.ok) throw new Error('Fetch stats failed');

    // 5. Create Task
    console.log('\n5️⃣ Testing Create Task (/api/tasks)...');
    const newTaskPayload = {
      title: 'Automated Test Task #99',
      description: 'Created by automated verification runner',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    };
    const createRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newTaskPayload)
    });
    const createData = await createRes.json();
    console.log('   Status:', createRes.status, '| Created task ID:', createData.task?.id);
    if (!createRes.ok) throw new Error('Create task failed');
    const createdTaskId = createData.task.id;

    // 6. Update Task Status
    console.log('\n6️⃣ Testing Update Task Status (/api/tasks/:id)...');
    const updateRes = await fetch(`${API_BASE}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });
    const updateData = await updateRes.json();
    console.log('   Status:', updateRes.status, '| New Task Status:', updateData.task?.status);
    if (!updateRes.ok || updateData.task?.status !== 'IN_PROGRESS') throw new Error('Update task failed');

    // 7. Delete Task
    console.log('\n7️⃣ Testing Delete Task (/api/tasks/:id)...');
    const deleteRes = await fetch(`${API_BASE}/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    console.log('   Status:', deleteRes.status, '| Deleted ID:', deleteData.id);
    if (!deleteRes.ok) throw new Error('Delete task failed');

    // 8. Test Unauthorized Protection
    console.log('\n8️⃣ Testing Security Guard (Access without token)...');
    const unauthRes = await fetch(`${API_BASE}/tasks`);
    console.log('   Status:', unauthRes.status, '(Expected 401 Unauthorized)');
    if (unauthRes.status !== 401) throw new Error('Route security failed to reject unauthenticated request');

    console.log('\n🎉 ALL 8 API VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

runTests();
