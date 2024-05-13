<template>
    <div>
        <div v-if="!isSignedIn" ref="googleLoginBtn" class="btn_google"></div>
        <v-card v-if="isSignedIn">
            <v-img :src="user.imageUrl" :alt="user.name" height="200"></v-img>
            <v-card-text>
                <p>{{ user.name }}</p>
                <p>{{ user.email }}</p>
            </v-card-text>
        </v-card>
    </div>
</template>
  
<script setup>
    import { ref, onMounted } from 'vue'
    import axios from 'axios'
    import { useStore } from 'vuex'

    const googleLoginBtn = ref(null)
    const store = useStore()

    const isSignedIn = ref(false)

    let user = {
        imageUrl: '',
        name: '',
        email: ''
    };

    onMounted(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;

        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: '485620210718-p6dghjf760682uu6ppfcg6u0fsj94t09.apps.googleusercontent.com',
                callback: onSuccess,
                context: 'signin',
                auto_select: false, 
                auto_prompt: 'none', 
                prompt_parent_id: 'google-login-container',
                scope: 'email',
                referrerPolicy: {
                    policy: 'strict-origin-when-cross-origin'
                }
            });
            window.google.accounts.id.renderButton(
                googleLoginBtn.value, {
                text: 'Sign In',
                size: 'large', 
                width: '366', 
                theme: 'outline', 
                logo_alignment: 'center' 
            });
        };
        document.head.appendChild(script);
    });

    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    async function onSuccess(googleUser) {
        const userPayload = parseJwt(googleUser.credential);
        const tokenResponse = await axios.post('https://localhost:4000/passport/login', userPayload);
        try {
            const activosRecibidos = await axios.get('https://localhost:4000/activo', {
                headers: {
                    Authorization: `Bearer ${tokenResponse.data.token}`,
                },
            });
            store.dispatch('updateAutorizacion', true);
            isSignedIn.value = true;
            user = {
                imageUrl: userPayload.picture,
                name: userPayload.name,
                email: userPayload.email
            };

        } catch (error) {
            if (error.response && error.response.status === 401) {
                store.dispatch('updateAutorizacion', false);
                console.error('No estás autorizado:', error.message);
                isSignedIn.value = false
            } else {
                console.error('Error al obtener activos:', error.message);
            }
        }
        store.dispatch('updateToken', tokenResponse.data.token);
    }
</script>