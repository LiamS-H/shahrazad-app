#[macro_export]
macro_rules! branded_string {
    ($name:ident) => {
        #[derive(Reflect, Serialize, Deserialize, Clone, PartialEq, Eq, Hash, Debug)]
        pub struct $name(String);

        impl $name {
            pub fn new(value: String) -> Self {
                Self(value)
            }
        }

        impl std::ops::Deref for $name {
            type Target = str;

            fn deref(&self) -> &str {
                &self.0
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }

        impl From<String> for $name {
            fn from(value: String) -> Self {
                Self(value)
            }
        }

        impl From<&str> for $name {
            fn from(value: &str) -> Self {
                Self(value.to_string())
            }
        }
    };
}
