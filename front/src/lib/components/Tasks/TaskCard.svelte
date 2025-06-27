<script lang="ts">
    let { task } = $props() 
</script>

<li>
    <a href="/task/{task._id}" class="block hover:bg-gray-50">
        <div class="px-4 py-4 sm:px-6">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div class="flex items-center justify-between">
                <div class="flex flex-col">
                    <p class="text-sm font-medium text-blue-600 truncate">
                        Type: {task.type}
                    </p>
                    <p class="mt-1 text-sm text-gray-600">
                        Status: <span class="font-medium">{task.status}</span>
                    </p>
                </div>
                {#if task.createdAt}
                    <div class="text-sm text-gray-500">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                {/if}
                <div class="text-sm font-medium text-gray-500 due-date">
                    Due Date: {new Date(task.dueDate).toLocaleString()}
                </div>
            </div>
            <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                        Timeout: {task.transactionTimeout}s
                    </p>
                    <p class="flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Distribution Percentage (%): {task.distribution_percentage}s
                    </p>
                    <p class="flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Wallets: {task.customWallets && task.customWallets.length > 0 ? task.customWallets.length : task.walletsCount}
                    </p>
                </div>
            </div>
        </div>
    </a>
</li>


<style>
    .block{
        position: relative;
    }
    .due-date{
        position: absolute;
        right: 1rem;
        top: 1rem;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .sm\:flex {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .sm\:ml-6 {
            margin-left: 0 !important;
        }
        
        .sm\:mt-0 {
            margin-top: 0.5rem !important;
        }
        
        .due-date {
            position: static;
            margin-top: 0.5rem;
        }
    }
</style>